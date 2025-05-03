"use client";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useMiniAppContext } from '@/hooks/use-miniapp-context';

// Replace with your actual NFT contract address
const NFT_CONTRACT_ADDRESS = '0x19605E2890FBa08322c86551bE4BF4e50fF778B8';

// MiniMON contract ABI (only the functions we need)
const CONTRACT_ABI = [
  "function mint(address to) public payable returns (uint256)",
  "function safeMint(address to) public returns (uint256)",
  "function owner() view returns (address)",
  "function mintPrice() view returns (uint256)",
  "function maxSupply() view returns (uint256)",
  "function _nextTokenId() view returns (uint256)"
];

// Define the MintResult type
interface MintResult {
  success: boolean;
  txHash?: string;
  tokenId?: string;
  error?: string;
}

export default function MintNFT() {
  const { context, actions, isEthProviderAvailable } = useMiniAppContext();
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [mintPrice, setMintPrice] = useState<string>("0.001");
  const [contractInfo, setContractInfo] = useState({
    currentSupply: "0",
    maxSupply: "1000000"
  });
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    if (isEthProviderAvailable) {
      fetchContractInfo();
    }
  }, [isEthProviderAvailable]);

  const fetchContractInfo = async () => {
    try {
      const provider = (window as any).ethereum;
      
      if (!provider) {
        return;
      }
      
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        CONTRACT_ABI,
        ethersProvider
      );
      
      // Get mint price
      const price = await nftContract.mintPrice();
      setMintPrice(ethers.utils.formatEther(price));
      
      // Get max supply
      const maxSupply = await nftContract.maxSupply();
      
      // Try to get current token ID
      let currentSupply = "0";
      try {
        const nextTokenId = await nftContract._nextTokenId();
        currentSupply = nextTokenId.toString();
      } catch (error: unknown) {
        console.warn("Could not fetch current token ID:", error);
      }
      
      setContractInfo({
        currentSupply,
        maxSupply: maxSupply.toString()
      });
      
      // Check if user is owner
      try {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const userAddress = accounts[0];
          const contractOwner = await nftContract.owner();
          const isOwnerCheck = contractOwner.toLowerCase() === userAddress.toLowerCase();
          
          console.log("User address:", userAddress);
          console.log("Contract owner:", contractOwner);
          console.log("Is user the owner?", isOwnerCheck);
          
          setIsOwner(isOwnerCheck);
        }
      } catch (error: unknown) {
        console.warn("Could not check owner status:", error);
      }
    } catch (error: unknown) {
      console.error("Error fetching contract info:", error);
      setDebugInfo(`Error fetching contract info: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  const handleMint = async () => {
    if (!context || !actions || !isEthProviderAvailable) {
      alert('Wallet connection not available');
      return;
    }

    setIsMinting(true);
    setMintResult(null);
    setDebugInfo(null);

    try {
      // Get the Ethereum provider using the window.ethereum
      const provider = (window as any).ethereum;
      
      if (!provider) {
        throw new Error('Failed to get Ethereum provider');
      }
      
      // Convert to ethers provider
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      
      // Request accounts to connect to the wallet
      await provider.request({ method: 'eth_requestAccounts' });
      
      // Now get the signer after connecting
      const signer = ethersProvider.getSigner();
      
      // Get user's address
      const accounts = await provider.request({ method: 'eth_accounts' });
      const userAddress = accounts[0];
      
      if (!userAddress) {
        throw new Error('No wallet address found');
      }

      // Create contract instance
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      // Check if the connected wallet is the contract owner
      const contractOwner = await nftContract.owner();
      const userIsOwner = contractOwner.toLowerCase() === userAddress.toLowerCase();
      setIsOwner(userIsOwner);
      
      // Check contract state before minting
      try {
        // Check current token ID
        const nextTokenId = await nftContract._nextTokenId();
        const maxSupply = await nftContract.maxSupply();
        
        console.log(`Current supply: ${nextTokenId}/${maxSupply}`);
        setDebugInfo(`Current supply: ${nextTokenId}/${maxSupply}`);
        
        if (nextTokenId.gte(maxSupply)) {
          throw new Error("Maximum supply reached. No more NFTs can be minted.");
        }
        
        // Check mint price
        const mintPriceWei = await nftContract.mintPrice();
        console.log("Mint price:", ethers.utils.formatEther(mintPriceWei), "ETH");
      } catch (error: unknown) {
        console.error("Error checking contract state:", error);
        throw new Error(`Error checking contract state: ${error instanceof Error ? error.message : String(error)}`);
      }

      let tx;
      if (userIsOwner) {
        // Owner can mint for free using safeMint
        console.log("Minting as owner using safeMint");
        tx = await nftContract.safeMint(userAddress, {
          gasLimit: 300000 // Set a reasonable gas limit
        });
      } else {
        // Regular users need to pay the mint price
        const mintPriceWei = await nftContract.mintPrice();
        console.log("Minting as regular user with payment:", ethers.utils.formatEther(mintPriceWei), "ETH");
        
        tx = await nftContract.mint(userAddress, {
          value: mintPriceWei,
          gasLimit: 300000 // Set a reasonable gas limit
        });
      }
      
      console.log("Transaction sent:", tx.hash);
      setDebugInfo(prev => `${prev || ''}\nTransaction sent: ${tx.hash}`);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      // Try to extract the token ID from the event logs
      let tokenId = "";
      try {
        // Look for Transfer event which should contain the token ID
        const transferEvent = receipt.events?.find(
          (event: any) => event.event === 'Transfer'
        );
        
        if (transferEvent && transferEvent.args) {
          tokenId = transferEvent.args[2].toString(); // tokenId is typically the third parameter
          console.log("Extracted token ID:", tokenId);
        }
      } catch (error: unknown) {
        console.warn("Could not extract token ID from events:", error);
      }
      
      const result: MintResult = {
        success: true,
        txHash: receipt.transactionHash,
        tokenId
      };
      
      setMintResult(result);
      
      if (result.success && context) {
        // Send notification on successful mint
        const userFid = context.user?.fid;
        
        if (userFid) {
          await fetch('/api/notify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fid: userFid,
              title: 'MiniMON NFT Minted!',
              body: `You successfully minted a MiniMON NFT${tokenId ? ` with Token ID: ${tokenId}` : ''}. Tx: ${result.txHash?.substring(0, 10)}...`,
            }),
          });
        }
      }
      
      // Refresh contract info after minting
      fetchContractInfo();
    } catch (error: unknown) {
      console.error('Mint error:', error);
      
      // Try to extract more specific error message
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Look for common revert reasons
        if (errorMessage.includes("Max supply reached")) {
          errorMessage = "Maximum supply reached. No more NFTs can be minted.";
        } else if (errorMessage.includes("Insufficient payment")) {
          errorMessage = "Insufficient payment. Please send the required amount of ETH.";
        } else if (errorMessage.includes("Ownable: caller is not the owner")) {
          errorMessage = "Only the contract owner can call this function.";
        } else if (errorMessage.includes("CALL_EXCEPTION")) {
          errorMessage = "Transaction failed. This could be due to insufficient funds, contract restrictions, or network issues.";
        }
      }
      
      setMintResult({
        success: false,
        error: errorMessage
      });
      
      setDebugInfo(prev => `${prev || ''}\nError: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsMinting(false);
    }
  };
  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <h1 className="text-2xl font-bold">Mint MiniMON</h1>
      
      {!isEthProviderAvailable && (
        <div className="text-red-500">
          Ethereum provider not available. Please use a compatible wallet.
        </div>
      )}
      
      <div className="bg-black text-white border border-gray-700 rounded-lg p-4 w-full max-w-md">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">NFT Information</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-blue-700">Mint Price:</div>
          <div className="font-medium">{isOwner ? "Free (Owner)" : `${mintPrice} ETH`}</div>
          
          <div className="text-blue-700">Current Supply:</div>
          <div className="font-medium">{contractInfo.currentSupply} / {contractInfo.maxSupply}</div>
          
          <div className="text-blue-700">Your Role:</div>
          <div className="font-medium">{isOwner ? "Contract Owner" : "Regular User"}</div>
        </div>
      </div>
      
      <button
        onClick={handleMint}
        disabled={isMinting || !isEthProviderAvailable}
        className={`px-6 py-2 rounded-lg font-medium ${
          isMinting || !isEthProviderAvailable
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isMinting ? 'Minting...' : isOwner ? 'Mint (Free)' : `Mint (${mintPrice} ETH)`}
      </button>
      
      {mintResult && (
        <div className={`mt-4 p-3 rounded-lg w-full max-w-md ${mintResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {mintResult.success ? (
            <div>
              <p className="font-bold">Success!</p>
              {mintResult.tokenId && (
                <p className="text-sm">Token ID: {mintResult.tokenId}</p>
              )}
              <p className="text-sm mt-2">
                <a 
                  href={`https://testnet.monadexplorer.com/tx/${mintResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Explorer
                </a>
              </p>
            </div>
          ) : (
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{mintResult.error}</p>
            </div>
          )}
        </div>
      )}
      
      {/* {debugInfo && (
        <div className="mt-4 p-3 bg-gray-100 text-gray-800 rounded-lg w-full max-w-md text-xs font-mono">
          <p className="font-bold mb-1">Debug Information:</p>
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )} */}
    </div>
  );
}
