'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleSaveRecipe(recipeId: number, slug: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Bạn cần đăng nhập để lưu công thức' }

  // Kiểm tra đã lưu chưa
  const { data: existing } = await supabase
    .from('saved_recipes')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .single()

  if (existing) {
    await supabase.from('saved_recipes').delete().eq('id', existing.id)
    revalidatePath(`/recipes/${slug}`)
    return { saved: false }
  } else {
    await supabase.from('saved_recipes').insert({ user_id: user.id, recipe_id: recipeId })
    revalidatePath(`/recipes/${slug}`)
    return { saved: true }
  }
}
