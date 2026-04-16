import { Outlet } from 'react-router-dom'

export default function DashboardLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar placeholder */}
      <aside className="w-64 bg-gray-900" />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header placeholder */}
        <header className="h-16 bg-white border-b" />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
