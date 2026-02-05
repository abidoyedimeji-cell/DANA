import { Suspense } from "react"
import { SearchConnections } from "@/components/search/search-connections"

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <div className="min-h-screen bg-black pb-20">
        <SearchConnections />
      </div>
    </Suspense>
  )
}
