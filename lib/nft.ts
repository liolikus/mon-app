import { ethers } from 'ethers';

// Simple ERC-721 ABI for minting
const NFT_ABI = [
  "function mint(address to) public",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];

export interface MintResult {
  success: boolean;
  txHash?: string;
  tokenId?: string; 
  error?: string;
}


export async function mintNFT(
  provider: ethers.providers.JsonRpcProvider,
  contractAddress: string,
  userAddress: string
): Promise<MintResult> {
  try {
    const signer = await provider.getSigner();
    const nftContract = new ethers.Contract(contractAddress, NFT_ABI, signer);
    
    // Call the mint function on the contract
    const tx = await nftContract.mint(userAddress);
    const receipt = await tx.wait();
    
    // Try to extract the token ID from the event logs
    let tokenId = "";
    try {
      // Look for Transfer event which should contain the token ID
      const transferEvent = receipt.events?.find(
        (event: any) => event.event === 'Transfer'
      );
      
      if (transferEvent && transferEvent.args) {
        tokenId = transferEvent.args[2].toString(); // tokenId is typically the third parameter
      }
    } catch (error) {
      console.warn("Could not extract token ID from events:", error);
    }
    
    return {
      success: true,
      txHash: receipt.transactionHash,
      tokenId: tokenId
    };
  } catch (error) {
    console.error("Error minting NFT:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
