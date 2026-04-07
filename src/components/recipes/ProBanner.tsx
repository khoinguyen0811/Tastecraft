export default function ProBanner() {
  return (
    <div className="mt-12 bg-[#5d3a1a] rounded-[2rem] p-10 flex flex-col md:flex-row items-center text-white relative overflow-hidden">
      <div className="md:w-3/5 z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest border px-3 py-1 rounded-full border-white/30 inline-block mb-4">Tuyển chọn cao cấp</span>
        <h2 className="text-4xl font-serif font-bold mb-4 leading-tight">Nghệ thuật Lên Kế hoạch Bữa ăn Hàng ngày</h2>
        <p className="text-white/70 mb-8">Mở khóa thực đơn hàng tuần độc quyền, theo dõi dinh dưỡng và danh sách đi chợ nghệ thuật được thiết kế cho ngôi nhà Việt hiện đại.</p>
        <button className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-xl transition">
          Nâng cấp lên Culinaria+
        </button>
      </div>
      <div className="md:w-2/5 mt-8 md:mt-0 flex justify-center">
        <img
          src="https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=400"
          className="w-64 rounded-2xl border-4 border-white/20 shadow-2xl rotate-3"
          alt="Culinaria+"
        />
      </div>
    </div>
  )
}
