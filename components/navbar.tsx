"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Activity } from "lucide-react"

export function Navbar() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Activity className="h-6 w-6 text-primary" />
            <span>센서 확인</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}