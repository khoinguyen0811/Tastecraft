'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập' }

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const banner_image = (formData.get('banner_image') as string).trim() || null
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const max_recipes_per_user = parseInt(formData.get('max_recipes_per_user') as string) || 2

  if (!title || !start_date || !end_date) return { error: 'Vui lòng điền đầy đủ thông tin' }

  const admin = createAdminClient()
  const { data, error } = await admin.from('events').insert({
    title, description, banner_image, start_date, end_date, max_recipes_per_user, created_by: user.id,
  }).select().single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/events')
  return { success: true, event: { ...data, participant_count: 0 } }
}

export async function toggleEventActive(id: number, current: boolean) {
  const admin = createAdminClient()
  const { error } = await admin.from('events').update({ is_active: !current }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/events')
  return { success: true }
}

export async function deleteEvent(id: number) {
  const admin = createAdminClient()
  const { error } = await admin.from('events').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/events')
  return { success: true }
}

export async function updateEvent(id: number, formData: FormData) {
  const admin = createAdminClient()
  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const banner_image = (formData.get('banner_image') as string).trim() || null
  const max_recipes_per_user = parseInt(formData.get('max_recipes_per_user') as string) || 2

  if (!title) return { error: 'Vui lòng nhập tên sự kiện' }

  const { error } = await admin.from('events').update({
    title, description, banner_image, max_recipes_per_user,
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/events')
  return { success: true }
}
