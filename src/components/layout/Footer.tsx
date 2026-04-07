export default function Footer() {
  return (
    <footer className="bg-[#f3f3f3] mt-24 py-20">
      <div className="mx-auto w-full max-w-[1200px] px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <h3 className="text-2xl font-bold text-orange-800 mb-6 font-serif">Culinaria</h3>
          <p className="text-gray-500 text-sm leading-relaxed">Nâng tầm nghệ thuật nấu ăn tại nhà thông qua những câu chuyện biên tập và những trải nghiệm ẩm thực được chọn lọc.</p>
          <div className="flex space-x-4 mt-6">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><i className="fab fa-facebook-f text-xs"></i></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><i className="fab fa-instagram text-xs"></i></div>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest mb-6">Lưu trữ</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li>Thu hoạch Mùa xuân</li>
            <li>Hơi ấm Mùa đông</li>
            <li>Vùng biển Mùa hè</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest mb-6">Bậc thầy</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li>Kỹ năng Dao kéo</li>
            <li>Khoa học Nước sốt</li>
            <li>Lên men</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest mb-6">Bản tin</h4>
          <p className="text-sm text-gray-500 mb-4">Công thức mới nhất gửi đến hộp thư của bạn.</p>
          <div className="relative">
            <input type="email" placeholder="Địa chỉ Email" className="w-full bg-white rounded-full py-3 px-6 focus:outline-none border-none shadow-sm" />
            <button className="absolute right-2 top-2 bg-orange-800 text-white w-8 h-8 rounded-full">
              <i className="fa fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1200px] px-4 mt-20 pt-8 border-t border-gray-200 flex justify-between text-[10px] text-gray-400 uppercase tracking-widest">
        <p>© 2026 Culinaria. Bảo lưu mọi quyền.</p>
        <div className="space-x-6">
          <span>Chính sách Bảo mật</span>
          <span>Điều khoản Dịch vụ</span>
        </div>
      </div>
    </footer>
  )
}
