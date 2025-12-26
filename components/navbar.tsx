"use client"

import Link from "next/link"
import { usePathname } from "next/navigation" // 현재 경로 확인용 (선택사항)
import { ThemeToggle } from "@/components/theme-toggle"
import { Activity, Box } from "lucide-react" // Box 아이콘 추가
import { cn } from "@/lib/utils" // 스타일 조건부 적용을 위해 (없으면 제외 가능)

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {/* 메인 로고/홈 링크 */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
            <Activity className="h-6 w-6 text-primary" />
            <span>센서 확인</span>
          </Link>

          {/* --- [추가됨] 네비게이션 메뉴 --- */}
          <nav className="flex items-center gap-4 ml-6">
            <Link 
              href="/digital-twin" 
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/digital-twin" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Box className="h-4 w-4" />
              <span>디지털 트윈</span>
            </Link>
          </nav>
          {/* --------------------------------- */}

        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}