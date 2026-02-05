import { ConnectionsList } from "@/components/connections/connections-list"

export default function ConnectionsPage() {
  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="sticky top-0 z-10 bg-black border-b border-white/10 px-4 py-3">
        <h1 className="text-white font-bold text-lg">Connections</h1>
      </div>
      <ConnectionsList />
    </div>
  )
}
