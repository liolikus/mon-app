import { NextRequest, NextResponse } from "next/server";
import { mintNFT } from "@/lib/nft";
import { sendMintSuccessNotification } from "@/lib/mint-notification";
import { ethers } from "ethers";

// Use the same contract address as in your mint-nft.tsx component
const NFT_CONTRACT_ADDRESS = '0x19605E2890FBa08322c86551bE4BF4e50fF778B8';

export async function POST(req: NextRequest) {
  try {
    const { address, fid } = await req.json();
    
    // Create a provider - you'll need to use the appropriate RPC URL for your network
    // For Monad testnet, you might use something like:
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.testnet.monad.xyz");
    
    // Call mintNFT with the required parameters
    const result = await mintNFT(
      provider,
      NFT_CONTRACT_ADDRESS,
      address
    );
    
    if (result.success && fid) {
      // Send notification on successful mint
      await sendMintSuccessNotification(fid, result.tokenId || "unknown");
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Mint error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
