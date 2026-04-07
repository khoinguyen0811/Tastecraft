'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitReport(recipeId: number, reason: string, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Bạn cần đăng nhập để báo cáo' }

  // Kiểm tra đã report chưa
  const { data: existing } = await supabase
    .from('recipe_reports')
    .select('id')
    .eq('recipe_id', recipeId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return { error: 'Bạn đã báo cáo công thức này rồi' }

  const { error } = await supabase.from('recipe_reports').insert({
    recipe_id: recipeId,
    user_id: user.id,
    reason,
    note: note.trim() || null,
  })

  if (error) return { error: error.message }
  return { success: true }
}
