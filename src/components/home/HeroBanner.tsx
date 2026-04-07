export default function HeroBanner() {
  return (
    <section className="relative rounded-[2.5rem] overflow-hidden h-[550px] mb-16 mt-2">
      <img
        src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1600"
        className="w-full h-full object-cover"
        alt="Hero"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-16">
        <span className="text-orange-300 text-[10px] uppercase tracking-[0.3em] font-bold mb-6">✨ Biên tập mùa đông</span>
        <h1 className="text-white text-6xl font-serif font-bold leading-tight mb-6 max-w-lg">
          Sắc Nâu Trầm & <br /> Rễ Củ Nướng
        </h1>
        <p className="text-white/80 max-w-sm mb-10 leading-relaxed">
          Tận hưởng mùa nấu chậm. Khám phá bộ sưu tập các công thức đậm đà hương vị đất trời, được tuyển chọn kỹ lưỡng cho những đêm đông dài ấm cúng.
        </p>
        <div className="flex space-x-4">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold transition shadow-lg shadow-orange-900/20">
            Xem bộ sưu tập
          </button>
          <button className="bg-white/90 hover:bg-white text-gray-800 px-8 py-3.5 rounded-xl font-bold transition">
            Học kỹ thuật
          </button>
        </div>
      </div>
    </section>
  )
}
