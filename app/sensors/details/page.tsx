"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";

// 데이터 타입 정의
interface ChartDataPoint {
  timestamp: string;
  node_type: string;
  temperature?: number;
  humidity?: number;
  motion?: number;
  current?: number;
  power?: number;
  time: string; // 그래프 X축용 시간 문자열
}

export default function SensorDetailPage() {
  const [timeframe, setTimeframe] = useState("1h");
  const [envData, setEnvData] = useState<ChartDataPoint[]>([]);
  const [pwrData, setPwrData] = useState<ChartDataPoint[]>([]);
  
  // 초기 로딩 상태만 관리하기 위해 loading state 사용
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = async (isBackgroundRefresh = false) => {
    // 배경 갱신(5초 주기)일 때는 로딩바를 띄우지 않음
    if (!isBackgroundRefresh) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const response = await fetch(`/api/sensors/history?timeframe=${timeframe}`);
      if (!response.ok) throw new Error("데이터를 불러오는데 실패했습니다.");
      
      const data: any[] = await response.json();

      // 데이터 가공: UTC -> 로컬 시간 포맷팅
      const formattedData = data.map((item) => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString('ko-KR', { 
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
        }),
      }));

      // 환경 데이터(ENV)와 전력 데이터(PWR) 분리
      setEnvData(formattedData.filter(d => d.node_type === 'ENV'));
      setPwrData(formattedData.filter(d => d.node_type === 'PWR'));

    } catch (error: any) {
      console.error("Fetch error:", error);
      setError(error.message);
    } finally {
      // 로딩이 켜져있었다면 끈다
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // 1. 컴포넌트 마운트 또는 timeframe 변경 시: 로딩바 표시 O
    fetchChartData(false);

    // 2. 주기적 갱신 (5초): 로딩바 표시 X (깜빡임 방지)
    const interval = setInterval(() => {
      fetchChartData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [timeframe]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 상단 네비게이션 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">센서 상세 분석</h1>
            <p className="text-muted-foreground">온습도, 보안, 전력 소비량 이력 조회</p>
          </div>
        </div>
        
        <Tabs value={timeframe} onValueChange={setTimeframe}>
          <TabsList>
            <TabsTrigger value="1h">최근 1시간</TabsTrigger>
            <TabsTrigger value="24h">24시간</TabsTrigger>
            <TabsTrigger value="7d">7일</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          Error: {error}
        </div>
      )}

      {/* 1. 전력 모니터링 차트 */}
      <Card className="border-l-4 border-l-yellow-500 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            전력 소비량 & 전류 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-[300px] w-full" /> : (
            <div className="h-[300px] w-full">
              {pwrData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pwrData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" minTickGap={30} fontSize={12} />
                    <YAxis yAxisId="left" orientation="left" stroke="#eab308" label={{ value: '전력 (W)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#8884d8" label={{ value: '전류 (A)', angle: -90, position: 'insideRight' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="power" stroke="#eab308" fillOpacity={1} fill="url(#colorPower)" name="전력(W)" animationDuration={500} />
                    <Line yAxisId="right" type="monotone" dataKey="current" stroke="#8884d8" dot={false} strokeWidth={2} name="전류(A)" animationDuration={500} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  해당 기간의 전력 데이터가 없습니다.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. 온습도 차트 */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>온도 및 습도 변화</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-[300px] w-full" /> : (
            <div className="h-[300px] w-full">
              {envData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={envData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" minTickGap={30} fontSize={12} />
                    <YAxis yAxisId="left" stroke="#ef4444" label={{ value: '온도(°C)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" label={{ value: '습도(%)', angle: -90, position: 'insideRight' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="temperature" stroke="#ef4444" fill="url(#colorTemp)" name="온도" animationDuration={500} />
                    <Area yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" fill="url(#colorHum)" name="습도" animationDuration={500} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  해당 기간의 환경 데이터가 없습니다.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. 움직임 감지 차트 */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>보안/움직임 이력</CardTitle>
        </CardHeader>
        <CardContent>
           {loading ? <Skeleton className="h-[150px] w-full" /> : (
            <div className="h-[150px] w-full">
              {envData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={envData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" minTickGap={30} fontSize={12} />
                    <YAxis dataKey="motion" domain={[0, 1]} ticks={[0, 1]} tickFormatter={(val) => (val === 1 ? '감지' : '')} />
                    <Tooltip 
                      labelFormatter={(label) => `시간: ${label}`}
                      formatter={(val) => val === 1 ? ["감지됨", "상태"] : ["없음", "상태"]}
                    />
                    <Bar dataKey="motion" fill="#f97316" name="움직임 여부" barSize={20} animationDuration={500} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                   데이터 없음
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}