import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadToCloudinary, MAX_FILE_SIZE } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Không có file' }, { status: 400 })

  // Kiểm tra loại file
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Chỉ chấp nhận file ảnh' }, { status: 400 })
  }

  // Giới hạn dung lượng 2MB
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Ảnh không được vượt quá 2MB' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadToCloudinary(buffer)

  return NextResponse.json({ url })
}
