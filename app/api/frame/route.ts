import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Handle frame interaction
    // This is where you'd process the frame action
    // For now, we'll just redirect to the main app
    
    return NextResponse.json({
      version: "vNext",
      image: {
        src: `${process.env.NEXT_PUBLIC_URL}/minimon-success.png`,
        aspectRatio: "1:1"
      },
      buttons: [
        {
          label: "Open MiniMon App",
          action: "link",
          target: process.env.NEXT_PUBLIC_URL
        }
      ]
    });
  } catch (error) {
    console.error('Frame error:', error);
    return NextResponse.json(
      { error: 'Failed to process frame' },
      { status: 500 }
    );
  }
}
