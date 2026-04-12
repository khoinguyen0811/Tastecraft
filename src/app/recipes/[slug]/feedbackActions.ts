'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { awardXP } from '@/lib/xp'

export async function createFeedback(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Bạn cần đăng nhập để gửi đánh giá' }

  const recipeId = Number(formData.get('recipeId'))
  const rating = Number(formData.get('rating'))
  const content = formData.get('content') as string
  const result_image = (formData.get('result_image') as string) || null

  if (!rating || rating < 1 || rating > 5) return { error: 'Vui lòng chọn số sao' }
  if (!content?.trim()) return { error: 'Vui lòng nhập nội dung đánh giá' }

  const { data: existing } = await supabase
    .from('recipe_feedbacks')
    .select('id')
    .eq('recipe_id', recipeId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return { error: 'Bạn đã đánh giá công thức này rồi' }

  const { error } = await supabase.from('recipe_feedbacks').insert({
    recipe_id: recipeId,
    user_id: user.id,
    rating,
    content: content.trim(),
    result_image,
  })

  if (error) return { error: error.message }

  // +5 XP cho người comment
  await awardXP(user.id, 'COMMENT', String(recipeId))

  const slug = formData.get('slug') as string
  revalidatePath(`/recipes/${slug}`)
  return { success: true }
}
