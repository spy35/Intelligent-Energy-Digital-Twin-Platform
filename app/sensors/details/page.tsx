"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartDataPoint {
  timestamp: string;
  temperature: number;
  humidity: number;
  motion: number;
  time: string; // 포맷팅된 시간
}

export default function SensorDetailPage() {
  const [timeframe, setTimeframe] = useState("1h");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/sensors/history?timeframe=${timeframe}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "차트 데이터를 불러오는 데 실패했습니다.");
        }
        const data = await response.json();
        const formattedData = data.map((item: any) => ({
          ...item,
          // DB의 UTC 시간을 브라우저의 로컬 시간(한국 시간)으로 변환
          time: new Date(item.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        }));
        setChartData(formattedData);
      } catch (error: any) {
        console.error("Chart data fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
    // 10초마다 데이터 갱신
    const interval = setInterval(fetchChartData, 10000); 
    return () => clearInterval(interval);
  }, [timeframe]);


  return (
    <div className="container mx-auto py-6">
       <div className="mb-6">
        <Link href="/sensors">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로가기
          </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-2">온/습도/움직임 상세 차트</h1>
      <p className="text-muted-foreground mb-6">지난 데이터를 실시간으로 확인하세요.</p>
      
      {error && (
         <Card className="mb-4 bg-destructive/10 border-destructive">
            <CardContent className="pt-6">
                <p className="text-destructive font-medium text-center">{error}</p>
            </CardContent>
         </Card>
      )}

      {/* --- 온습도 차트 --- */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>온/습도 이력</CardTitle>
            <Tabs value={timeframe} onValueChange={setTimeframe}>
              <TabsList>
                <TabsTrigger value="1h">1시간</TabsTrigger>
                <TabsTrigger value="24h">24시간</TabsTrigger>
                <TabsTrigger value="7d">7일</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" stroke="#ef4444" label={{ value: '온도 (°C)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" label={{ value: '습도 (%)', angle: -90, position: 'insideRight' }} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value.toFixed(1)}${name === '온도' ? '°C' : '%'}`, name]}
                    labelFormatter={(label) => `시간: ${label}`}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="temperature" stroke="#ef4444" fill="url(#colorTemp)" name="온도" />
                  <Area yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" fill="url(#colorHum)" name="습도" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- 움직임 차트 --- */}
      <Card>
        <CardHeader>
          <CardTitle>움직임 감지 이력</CardTitle>
        </CardHeader>
        <CardContent>
           {loading ? (
            <Skeleton className="h-[150px] w-full" />
          ) : (
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis dataKey="motion" domain={[0, 1]} ticks={[0, 1]} tickFormatter={(value) => (value === 1 ? '감지' : '없음')} />
                  <Tooltip
                    formatter={(value: number) => [value === 1 ? "움직임 감지됨" : "움직임 없음", "상태"]}
                    labelFormatter={(label) => `시간: ${label}`}
                  />
                  <Bar dataKey="motion" fill="#f97316" name="움직임" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}