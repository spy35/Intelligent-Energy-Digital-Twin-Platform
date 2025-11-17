"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Thermometer, Droplets, RefreshCw, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SensorData {
  id: number;
  timestamp: string;
  temperature: number;
  humidity: number;
  motion: number;
}

export default function SensorPage() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestData = async (isManualRefresh = false) => {
    if (!isManualRefresh) {
        setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch("/api/sensors/latest");
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "최신 센서 데이터를 불러오는 데 실패했습니다.");
      }
      const data = await response.json();
      setSensorData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestData(false); // 첫 데이터 로드
    const interval = setInterval(() => fetchLatestData(true), 5000); // 5초마다 자동 갱신
    return () => clearInterval(interval);
  }, []);

  if (loading && !sensorData) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">센서 모니터링</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card><CardHeader><Skeleton className="h-6 w-24" /></CardHeader><CardContent><Skeleton className="h-10 w-32" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-24" /></CardHeader><CardContent><Skeleton className="h-10 w-32" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-24" /></CardHeader><CardContent><Skeleton className="h-10 w-32" /></CardContent></Card>
        </div>
      </div>
    );
  }

  const lastUpdated = sensorData?.timestamp ? new Date(sensorData.timestamp).toLocaleString('ko-KR') : "N/A";

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">실시간 센서 모니터링</h1>
        <Button variant="outline" size="sm" onClick={() => fetchLatestData(true)} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {error && (
         <Card className="mb-4 bg-destructive/10 border-destructive">
            <CardContent className="pt-6">
                <p className="text-destructive font-medium text-center">{error}</p>
            </CardContent>
         </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/sensors/details">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">온도</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sensorData ? `${sensorData.temperature.toFixed(1)}°C` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                마지막 업데이트: {lastUpdated}
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/sensors/details">
            <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">습도</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sensorData ? `${sensorData.humidity.toFixed(1)}%` : "N/A"}
              </div>
               <p className="text-xs text-muted-foreground">
                마지막 업데이트: {lastUpdated}
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/sensors/details">
            <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">움직임</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${sensorData?.motion === 1 ? 'text-red-500' : 'text-green-600'}`}>
                {sensorData ? (sensorData.motion === 1 ? "움직임 감지됨" : "움직임 없음") : "N/A"}
              </div>
               <p className="text-xs text-muted-foreground">
                마지막 업데이트: {lastUpdated}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
       <div className="mt-6 text-center">
          <Button asChild>
            <Link href="/sensors/details">자세히 보기 (실시간 차트)</Link>
          </Button>
        </div>
    </div>
  );
}