'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleRecipeActive(recipeId: number, currentState: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập' }

  const { error } = await supabase
    .from('recipes')
    .update({ is_active: !currentState })
    .eq('id', recipeId)
    .eq('user_id', user.id) // chỉ cho phép sửa công thức của mình

  if (error) return { error: error.message }

  revalidatePath('/my-recipes')
  return { success: true, newState: !currentState }
}

export async function deleteRecipe(recipeId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập' }

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/my-recipes')
  return { success: true }
}
