"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

const CsrfContext = createContext<string>("")

export function CsrfProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState("")

  useEffect(() => {
    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setToken(data.token))
      .catch(console.error)
  }, [])

  return <CsrfContext.Provider value={token}>{children}</CsrfContext.Provider>
}

export function useCsrf() {
  return useContext(CsrfContext)
}
