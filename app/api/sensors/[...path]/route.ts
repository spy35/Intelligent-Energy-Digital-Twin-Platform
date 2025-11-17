import { NextResponse } from "next/server";

// 💡 중요: <Tinker_Edge_R_IP> 부분을 실제 Tinker Edge R의 IP 주소로 변경하세요.
const SENSOR_API_URL = "http://<Tinker_Edge_R_IP>:5000/api/sensors";

async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/sensors", "");
  const searchParams = url.search;

  try {
    const response = await fetch(`${SENSOR_API_URL}${path}${searchParams}`, {
      // 실시간 데이터를 위해 캐시 사용 안함
      cache: "no-store",
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || `Sensor API fetch failed: ${response.statusText}`);
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