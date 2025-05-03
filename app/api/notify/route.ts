import { NextResponse } from 'next/server';
import { sendFrameNotification } from '@/lib/notifs';

export async function POST(request: Request) {
  try {
    const { fid, title, body } = await request.json();
    
    if (!fid || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await sendFrameNotification({ fid, title, body });
    
    if (result.state === 'success') {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: result.state === 'error' ? result.error : result.state },
        { status: result.state === 'error' ? 500 : 400 }
      );
    }
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
