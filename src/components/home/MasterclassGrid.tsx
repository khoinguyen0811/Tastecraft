const collections = [
  {
    label: 'Nghệ thuật',
    title: 'Bánh mì Men tự nhiên',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600',
    offset: false,
  },
  {
    label: 'Kỹ thuật',
    title: 'Mì Sợi Thủ Công',
    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600',
    offset: true,
  },
  {
    label: 'Chuyên sâu',
    title: 'Lửa & Thịt Nướng',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=600',
    offset: false,
  },
]

export default function MasterclassGrid() {
  return (
    <section>
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Bộ sưu tập Masterclass</h2>
        <p className="text-gray-400 max-w-xl">Đi sâu vào các lĩnh vực ẩm thực cụ thể, được giám tuyển bởi các chuyên gia toàn cầu và các bậc thầy vùng miền.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {collections.map((item) => (
          <div key={item.title} className={`aspect-[3/4] rounded-[2.5rem] overflow-hidden relative group cursor-pointer ${item.offset ? 'mt-12' : ''}`}>
            <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" alt={item.title} />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition"></div>
            <div className="absolute bottom-8 left-8 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2">{item.label}</p>
              <h4 className="text-xl font-bold">{item.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
