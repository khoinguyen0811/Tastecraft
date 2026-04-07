import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import CreateForm from './CreateForm'

export default async function CreateRecipePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="px-4 py-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tạo công thức mới</h1>
        <p className="text-gray-400 text-sm mt-1">Chia sẻ công thức của bạn với cộng đồng</p>
      </div>
      <Suspense>
        <CreateForm />
      </Suspense>
    </div>
  )
}
