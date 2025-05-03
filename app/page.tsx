import { Metadata } from 'next';
import MintNFT from '@/components/mint-nft';
import SafeAreaContainer from '@/components/safe-area-container';

//Define your frame for Farcaster
// const frame = {
//   version: "next",
//   imageUrl: "https://freeimage.host/i/3juIqsn",
//   button.title: "Mint!",
//   image: {
//     src: `${process.env.NEXT_PUBLIC_URL}/minimon-image.png`,
//     aspectRatio: "1:1"
//   },
//   buttons: [
//     {
//       label: "Mint MiniMon",
//       action: "launch_frame"
//     }
//   ],
//   postUrl: `${process.env.NEXT_PUBLIC_URL}/api/frame`
// };

const frame = {
  version: "next",
  imageUrl: "https://assembly-archives-vic-leslie.trycloudflare.com/images/miniMON.png",
  button: {
    title: "Mint!",
    action: {
      type: "launch_frame",
      url: "https://assembly-archives-vic-leslie.trycloudflare.com",
      name:"Mint!!!",
      splashImageUrl: "https://assembly-archives-vic-leslie.trycloudflare.com/images/Splash.png",
      splashBackgroundColor:"#f5f0ec"
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "MiniMon",
    openGraph: {
      title: "MiniMon mint",
      description: "Mint MiniMon",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return (
    <SafeAreaContainer>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <MintNFT />
      </main>
    </SafeAreaContainer>
  );
}
