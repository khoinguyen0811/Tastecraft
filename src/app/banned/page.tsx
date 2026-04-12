import Link from 'next/link'

export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5] px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fa fa-ban text-3xl text-red-500"></i>
        </div>
        <h1 className="text-2xl font-bold mb-3">Tài khoản bị tạm khóa</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Tài khoản của bạn đã bị tạm khóa do vi phạm chính sách cộng đồng Bếp Nhà Làm.
          Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
        </p>
        <Link href="/" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition">
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
