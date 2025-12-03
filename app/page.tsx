"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Activity, Droplets, Thermometer, Zap, AlertTriangle, CheckCircle2, Bell, BarChart3, Camera, Users, Leaf, Timer
} from "lucide-react";

// 센서 데이터 타입
interface SensorData {
  temperature?: number;
  humidity?: number;
  motion?: number; 
  current?: number;
  power?: number;
  people_count?: number;
  system_mode?: string;    // ACTIVE, HOLD, ECO
  system_message?: string; // 안내 메시지
  alert_level?: "normal" | "warning" | "critical";
  error?: string;
}

interface AlertLog {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

export default function Dashboard() {
  const [data, setData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const lastAlertTime = useRef<{ [key: string]: number }>({});
  const { toast } = useToast();

  const fetchSensorData = async () => {
    try {
      const res = await fetch("/api/sensors/latest");
      if (res.ok) {
        const jsonData = await res.json();
        setData(jsonData);
        checkAlerts(jsonData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkAlerts = (sensorData: SensorData) => {
    const now = Date.now();
    const COOLDOWN = 60000; 

    // 긴급 알람만 토스트 띄우기
    if (sensorData.alert_level === "critical") {
        if (lastAlertTime.current["sys"] && now - lastAlertTime.current["sys"] < COOLDOWN) return;
        
        const newAlert: AlertLog = { 
            id: now, 
            type: "system", 
            message: sensorData.system_message || "시스템 경고", 
            timestamp: new Date().toLocaleTimeString() 
        };
        setAlerts((prev) => [newAlert, ...prev]);
        lastAlertTime.current["sys"] = now;
        
        toast({ 
            title: "🚨 긴급 조치 필요", 
            description: sensorData.system_message, 
            variant: "destructive" 
        });
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 1000); 
    return () => clearInterval(interval);
  }, []);

  // [수정됨] 모드별 색상 (다크 모드 지원: dark: 접두사 사용)
  const getModeColor = (mode?: string) => {
      // Active: 초록색 배경 + 진한 초록 글씨
      if (mode === "ACTIVE") return "bg-green-100 text-green-900 border-green-500 dark:bg-green-900/40 dark:text-green-100 dark:border-green-700";
      // Hold: 노란색 배경 + 진한 노랑 글씨
      if (mode?.includes("HOLD")) return "bg-yellow-100 text-yellow-900 border-yellow-500 dark:bg-yellow-900/40 dark:text-yellow-100 dark:border-yellow-700";
      // Eco: 회색 배경 + 진한 회색 글씨
      if (mode === "ECO") return "bg-slate-100 text-slate-900 border-slate-500 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-600";
      return "bg-gray-100 dark:bg-gray-800";
  };

  const getModeIcon = (mode?: string) => {
      if (mode === "ECO") return <Leaf className="h-6 w-6"/>;
      if (mode?.includes("HOLD")) return <Timer className="h-6 w-6"/>;
      return <Activity className="h-6 w-6"/>;
  };

  if (loading && !data) return <div className="flex h-screen items-center justify-center">Loading System...</div>;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 p-4 md:p-8">
      <div className="flex flex-col gap-6">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">IoT Digital Twin System</h1>
          <div className="flex gap-4">
             <Badge variant={data?.error ? "destructive" : "outline"} className="h-9 px-4">
               {data?.error ? "연결 끊김" : "시스템 정상"}
             </Badge>
             <Popover>
               <PopoverTrigger asChild>
                 <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5"/>
                    {alerts.length > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-80" align="end">
                 <div className="p-4 border-b"><h4 className="font-medium">알람 로그</h4></div>
                 <ScrollArea className="h-64">
                    {alerts.map(a => <div key={a.id} className="p-3 border-b text-sm"><span className="font-medium">{a.message}</span><br/><span className="text-xs text-muted-foreground">{a.timestamp}</span></div>)}
                 </ScrollArea>
                 {alerts.length > 0 && (
                    <div className="p-2 border-t text-center">
                        <Button variant="ghost" size="sm" onClick={() => setAlerts([])} className="w-full h-8 text-xs">내역 지우기</Button>
                    </div>
                 )}
               </PopoverContent>
             </Popover>
          </div>
        </div>

        {/* --- [시스템 상태 배너] --- */}
        <Card className={`border-l-8 shadow-sm transition-colors duration-300 ${getModeColor(data?.system_mode)}`}>
            <CardContent className="flex items-center justify-between p-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {getModeIcon(data?.system_mode)}
                        Current Mode: {data?.system_mode || "Initializing..."}
                    </h2>
                    <p className="text-sm mt-1 font-bold opacity-90">
                        {data?.system_message || "시스템 데이터를 수신 중입니다."}
                    </p>
                </div>
                <div className="text-4xl opacity-30">
                    {data?.system_mode === "ECO" ? "🌱" : "⚡"}
                </div>
            </CardContent>
        </Card>

        {/* 메인 그리드 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            
            {/* 1. 온도 카드 */}
            <Card className={data?.temperature && data.temperature >= 28 ? "border-red-500 bg-red-50 dark:bg-red-950/30" : ""}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">실내 온도</CardTitle>
                    <Thermometer className={`h-4 w-4 ${data?.temperature && data.temperature >= 28 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data?.temperature?.toFixed(1) ?? "--"}°C</div>
                    <p className={`text-xs mt-1 ${data?.temperature && data.temperature >= 28 ? "text-red-600 dark:text-red-300 font-bold" : "text-muted-foreground"}`}>
                        {data?.temperature && data.temperature >= 28 ? "⚠️ 에어컨 가동 필요" : "적정 온도"}
                    </p>
                </CardContent>
            </Card>

            {/* 2. 습도 카드 */}
            <Card className={data?.humidity && data.humidity >= 50 ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : ""}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">실내 습도</CardTitle>
                    <Droplets className="h-4 w-4 text-blue-500"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data?.humidity?.toFixed(1) ?? "--"}%</div>
                    <p className={`text-xs mt-1 ${data?.humidity && data.humidity >= 50 ? "text-blue-600 dark:text-blue-300 font-bold" : "text-muted-foreground"}`}>
                        {data?.humidity && data.humidity >= 50 ? "💧 제습기 가동 필요" : "쾌적한 습도"}
                    </p>
                </CardContent>
            </Card>

            {/* 3. 보안(PIR) 카드 */}
            <Card className={data?.motion === 1 ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30" : ""}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">재실 감지 (PIR)</CardTitle>
                    <Activity className={`h-4 w-4 ${data?.motion === 1 ? "text-orange-600 dark:text-orange-400" : "text-green-500"}`}/>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${data?.motion === 1 ? "text-orange-600 dark:text-orange-300" : "text-green-600 dark:text-green-400"}`}>
                        {data?.motion === 1 ? "감지됨" : "없음"}
                    </div>
                </CardContent>
            </Card>

            {/* 4. 전력 모니터링 (고전력 시 빨간색 강조) */}
            <Card className={`col-span-full lg:col-span-3 ${data?.power && data.power >= 500 ? "border-red-500 shadow-md bg-red-50 dark:bg-red-950/30" : "border-yellow-500"}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">실시간 전력 소비량</CardTitle>
                    <Zap className={`h-4 w-4 ${data?.power && data.power >= 500 ? "text-red-500 animate-pulse" : "text-yellow-500"}`}/>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                        <span className="text-sm text-muted-foreground">Power (W)</span>
                        <div className={`text-4xl font-bold mt-1 ${data?.power && data.power >= 500 ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                            {data?.power?.toFixed(0) ?? 0} W
                        </div>
                    </div>
                    <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                        <span className="text-sm text-muted-foreground">Current (A)</span>
                        <div className="text-4xl font-bold">{data?.current?.toFixed(2) ?? 0.00} A</div>
                    </div>
                </CardContent>
            </Card>

            {/* 5. CCTV & AI 감시 */}
            <Card className="col-span-full lg:col-span-3 border-l-4 border-l-purple-500 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Camera className="h-5 w-5 text-purple-600 dark:text-purple-400"/> 실시간 현장 (AI Analysis)
                    </CardTitle>
                    <div className="bg-purple-100 dark:bg-purple-900/40 px-3 py-1 rounded-full text-purple-700 dark:text-purple-200 font-bold text-sm flex gap-2">
                        <Users className="h-4 w-4"/> AI 감지 인원: {data?.people_count ?? 0}명
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                        <img 
                           src="http://192.168.45.95:5000/video_feed"
                           alt="CCTV Loading..." 
                           className="w-full h-full object-contain"
                           onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded animate-pulse">LIVE</div>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        <div className="flex justify-center mt-6">
            <Button asChild size="lg">
                <Link href="/sensors/details"><BarChart3 className="mr-2 h-4 w-4"/> 상세 이력 보기</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}