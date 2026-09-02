"use client"

import { useRouter } from "next/navigation"
import { ROLE_COOKIE } from "@/lib/auth"

export function LogoutButton() {
  const router = useRouter()

  function handleLogout() {
    document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0`
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      Logout
    </button>
  )
}
