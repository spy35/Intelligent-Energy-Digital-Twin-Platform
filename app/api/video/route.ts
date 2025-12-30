// app/api/video/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // 1. 여기에 카메라용 Ngrok 주소를 넣으세요 (뒤에 /video_feed 유지)
  const CAMERA_URL = "https://teensy-gainable-shaunda.ngrok-free.dev/video_feed"; 

  try {
    // 2. Ngrok 서버로 영상을 요청합니다. (경고 무시 헤더 추가)
    const response = await fetch(CAMERA_URL, {
      cache: 'no-store',
      headers: {
        "ngrok-skip-browser-warning": "true", // 이 헤더가 핵심입니다!
      },
    });

    if (!response.ok) {
      throw new Error(`Camera feed error: ${response.status}`);
    }

    // 3. 받아온 영상 스트림을 그대로 브라우저에게 전달합니다.
    const newHeaders = new Headers(response.headers);
    
    // 브라우저가 이것이 영상임을 알 수 있게 헤더 설정
    newHeaders.set("Content-Type", response.headers.get("Content-Type") || "multipart/x-mixed-replace; boundary=frame");

    return new NextResponse(response.body, {
      status: 200,
      headers: newHeaders,
    });

  } catch (error) {
    console.error("Video proxy error:", error);
    return new NextResponse("Failed to load video feed", { status: 500 });
  }
}