import { NextResponse } from "next/server";

// 1. 여기에 본인의 Ngrok 주소를 정확히 넣어주세요. (뒤에 /api/sensors 유지)
const SENSOR_API_URL = "https://teensy-gainable-shaunda.ngrok-free.dev/api/sensors";

async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/sensors", "");
  const searchParams = url.search;

  try {
    const response = await fetch(`${SENSOR_API_URL}${path}${searchParams}`, {
      cache: "no-store",
      // 2. 이 헤더 부분이 경고창을 뚫어주는 핵심 열쇠입니다. (app.py 수정 필요 없음)
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
        // 에러 발생 시 로그를 출력해 원인을 봅니다.
        const errorText = await response.text();
        console.error("Ngrok Error:", errorText); 
        throw new Error(`API fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Sensor API proxy error:", error.message);
    return NextResponse.json(
      { error: "센서 데이터를 가져오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST };