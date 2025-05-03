import { NextRequest, NextResponse } from "next/server";
import { saveNotificationToken, removeNotificationToken } from "@/lib/db"; 

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Handle notification subscription events
    if (data.type === "notification-subscription") {
      const { fid, token, url, enabled } = data;
      
      if (enabled) {
        // Save the token for this user
        await saveNotificationToken({ fid, token, url });
      } else {
        // Remove the token for this user
        await removeNotificationToken(fid);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

