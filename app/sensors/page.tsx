// app/sensors/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Thermometer, Droplets, RefreshCw, Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SensorData {
  temperature?: number;
  humidity?: number;
  motion?: number;
  current?: number;
  power?: number;
  timestamp?: string; // DB에서 가져온 최근 시간
}

export default function SensorPage() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLatestData = async (isManualRefresh = false) => {
    if (!isManualRefresh) setLoading(true);
    try {
      const response = await fetch("/api/sensors/latest");
      if (response.ok) {
        const data = await response.json();
        setSensorData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestData(false);
    const interval = setInterval(() => fetchLatestData(true), 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !sensorData) {
    return <div className="container mx-auto py-6"><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">실시간 센서 모니터링</h1>
        <Button variant="outline" size="sm" onClick={() => fetchLatestData(true)}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. 온도 */}
        <Link href="/sensors/details">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">온도</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sensorData?.temperature ? `${sensorData.temperature}°C` : "--"}</div>
            </CardContent>
          </Card>
        </Link>
        
        {/* 2. 습도 */}
        <Link href="/sensors/details">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">습도</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sensorData?.humidity ? `${sensorData.humidity}%` : "--"}</div>
            </CardContent>
          </Card>
        </Link>
        
        {/* 3. 움직임 */}
        <Link href="/sensors/details">
          <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${sensorData?.motion === 1 ? 'border-red-500 bg-red-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">보안 상태</CardTitle>
              <Activity className={`h-4 w-4 ${sensorData?.motion === 1 ? 'text-red-500' : 'text-green-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${sensorData?.motion === 1 ? 'text-red-600' : 'text-green-600'}`}>
                {sensorData?.motion === 1 ? "감지됨!" : "안전함"}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 4. 전력 (NEW) */}
        <Link href="/sensors/details">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-yellow-400">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">소비 전력</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">
                {sensorData?.power ? `${sensorData.power.toFixed(0)} W` : "--"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                전류: {sensorData?.current ? sensorData.current.toFixed(2) : "0.0"} A
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8 text-center">
        <Button asChild size="lg">
          <Link href="/sensors/details">
            상세 이력 및 전체 그래프 보기
          </Link>
        </Button>
      </div>
    </div>
  );
}