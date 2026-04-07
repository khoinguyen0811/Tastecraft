import { RecipeFeedback } from '@/types'

interface Props {
  feedbacks: RecipeFeedback[]
}

export default function CommunityPhotos({ feedbacks }: Props) {
  const withPhotos = feedbacks.filter(f => f.result_image)
  if (withPhotos.length === 0) return null

  return (
    <div className="mt-24">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-bold mb-2">Hình ảnh món ăn</h2>
          <p className="text-gray-400">Xem cộng đồng của chúng tôi đã thực hiện món ăn này như thế nào.</p>
        </div>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-full text-sm transition">
          Tải lên ảnh của bạn
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {withPhotos[0] && (
          <div className="md:col-span-1 h-[500px] relative rounded-[2rem] overflow-hidden">
            <img src={withPhotos[0].result_image!} className="w-full h-full object-cover" alt="Community" />
            <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md px-4 py-1 rounded-full text-white text-[10px]">
              {withPhotos[0].users.username}
            </div>
          </div>
        )}
        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          {withPhotos.slice(1, 3).map(fb => (
            <div key={fb.id} className="rounded-[2rem] overflow-hidden h-60">
              <img src={fb.result_image!} className="w-full h-full object-cover" alt="Community" />
            </div>
          ))}
          {withPhotos[3] && (
            <div className="col-span-2 rounded-[2rem] overflow-hidden h-60 relative">
              <img src={withPhotos[3].result_image!} className="w-full h-full object-cover" alt="Community" />
              <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md px-4 py-1 rounded-full text-white text-[10px]">
                {withPhotos[3].users.username}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
