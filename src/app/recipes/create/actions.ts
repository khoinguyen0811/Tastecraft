'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    + '-' + Date.now()
}

export interface RecipePayload {
  title: string
  description: string
  cooking_time: number
  servings: number
  difficulty: string
  image_main: string
  event_id?: number | null
  ingredients: { name: string; qty: string }[]
  steps: { content: string; note: string; image: string }[]
}

export async function createRecipe(payload: RecipePayload) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập' }

  if (!payload.title?.trim()) return { error: 'Vui lòng nhập tên món ăn' }

  // Insert recipe
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      user_id: user.id,
      title: payload.title.trim(),
      slug: toSlug(payload.title),
      description: payload.description?.trim() || null,
      cooking_time: payload.cooking_time || 30,
      servings: payload.servings || 2,
      difficulty: payload.difficulty || '1',
      image_main: payload.image_main || null,
    })
    .select('id, slug')
    .single()

  if (recipeError) return { error: recipeError.message }

  // Insert ingredients
  const ingredients = payload.ingredients.filter(i => i.name.trim())
  if (ingredients.length > 0) {
    const { error: ingError } = await supabase.from('recipe_ingredients').insert(
      ingredients.map(i => ({
        recipe_id: recipe.id,
        name: i.name.trim(),
        quantity: i.qty.trim(),
      }))
    )
    if (ingError) console.error('ingredients error:', ingError.message)
  }

  // Insert steps
  const steps = payload.steps.filter(s => s.content.trim())
  if (steps.length > 0) {
    const { error: stepError } = await supabase.from('recipe_steps').insert(
      steps.map((s, i) => ({
        recipe_id: recipe.id,
        step_num: i + 1,
        content: s.content.trim(),
        note: s.note?.trim() || null,
        step_image: s.image?.trim() || null,
      }))
    )
    if (stepError) console.error('steps error:', stepError.message)
  }

  // Nếu tạo trong context event → join event_participants
  if (payload.event_id) {
    await supabase.from('event_participants').upsert({
      event_id: payload.event_id,
      user_id: user.id,
      recipe_id: recipe.id,
    }, { onConflict: 'event_id,user_id' })
  }

  return { slug: recipe.slug }
}
