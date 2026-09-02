"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ROLE_COOKIE, ROLE_LABELS, ROLES, type Role } from "@/lib/auth"
import { cn } from "@/lib/utils"

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter()
  const [role, setRole] = useState<Role>("citizen")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError("Enter any username and password to continue (demo login, not checked).")
      return
    }
    document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${60 * 60 * 24}`
    router.push(nextPath || "/")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-5">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sign in as
        </label>
        <div className="grid grid-cols-1 gap-2">
          {ROLES.map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                "rounded-md border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                role === r
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            placeholder="any username"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            placeholder="any password"
            autoComplete="off"
          />
        </div>
      </div>

      {error && <p className="text-xs text-status-bad">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Sign in
      </button>

      <p className="text-center text-[11px] leading-snug text-muted-foreground">
        Prototype login. Any username/password is accepted — this demonstrates role-based access,
        it is not a real authentication system.
      </p>
    </form>
  )
}
