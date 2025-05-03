import { sendFrameNotification } from "@/lib/notifs";

export async function sendMintSuccessNotification(fid: number, tokenId: string) {
  return sendFrameNotification({
    fid,
    title: "NFT Minted Successfully!",
    body: `Your miniMON NFT #${tokenId} has been minted and is now in your wallet.`,
  });
}
