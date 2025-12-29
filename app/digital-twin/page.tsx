"use client"

import React, { useState, useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

export default function DigitalTwinPage() {
  // Unity Context 설정 (파일명은 실제 public/unity 폴더 내 파일명과 일치시켜야 함)
  const { unityProvider, isLoaded, loadingProgression, sendMessage } = useUnityContext({
    loaderUrl: "/unity/Build.loader.js",
    dataUrl: "/unity/Build.data",
    frameworkUrl: "/unity/Build.framework.js",
    codeUrl: "/unity/Build.wasm",
  });

  // 센서 데이터를 가져와서 유니티로 보내는 로직 (디지털 트윈 연동)
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(async () => {
      try {
        // ✅ [수정됨] API 경로를 app.py와 일치시킴 (/api/sensors/latest)
        const res = await fetch('/api/sensors/latest'); 
        
        if(res.ok) {
            const data = await res.json();
            // Unity 내의 'SensorManager'라는 오브젝트의 'UpdateSensorData' 함수로 JSON 문자열 전달
            // 주의: Unity Hierarchy 창에서 이 스크립트가 붙은 오브젝트 이름이 "SensorManager"여야 함
            sendMessage("SensorManager", "UpdateSensorData", JSON.stringify(data));
        }
      } catch (e) {
        console.error("센서 데이터 동기화 실패", e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoaded, sendMessage]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">디지털 트윈 모니터링</h1>
      
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border shadow-xl">
        {/* 로딩 표시 */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <p>3D 공간을 불러오는 중... {Math.round(loadingProgression * 100)}%</p>
          </div>
        )}
        
        {/* 유니티 캔버스 */}
        <Unity 
            unityProvider={unityProvider} 
            style={{ width: "100%", height: "100%" }} 
        />
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>※ 마우스와 키보드를 사용하여 3D 공간을 탐색하세요.</p>
        <p>※ 실제 Tinker Edge R의 센서 데이터가 실시간으로 반영됩니다.</p>
      </div>
    </div>
  );
}