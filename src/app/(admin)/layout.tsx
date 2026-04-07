import Sidebar from './_components/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#f8f9fa] text-gray-800 flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-64">
        {children}
      </div>
    </div>
  )
}
