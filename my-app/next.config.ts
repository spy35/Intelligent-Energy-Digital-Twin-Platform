import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy-video",
        // ▼ 아래 주소를 실제 팅커보드 IP로 변경하세요 (예: http://192.168.0.50:5000/video_feed)
        destination: "http://192.168.45.95:5000/video_feed",
      },
      {
        source: "/api/sensors/:path*",
        // ▼ 여기도 마찬가지로 IP를 변경하세요
        destination: "http://192.168.45.95:5000/api/sensors/:path*",
      },
    ];
  },
};

export default nextConfig;