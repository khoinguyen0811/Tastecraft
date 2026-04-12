export type Difficulty = '1' | '2' | '3'

export const difficultyLabel: Record<Difficulty, string> = {
  '1': 'Dễ',
  '2': 'Trung bình',
  '3': 'Nâng cao',
}

export interface User {
  id: number
  username: string
  avatar: string
}

export interface Tag {
  id: number
  name: string
  type: 'method' | 'diet' | 'time'
  slug: string
}

export interface RecipeIngredient {
  id: number
  name: string
  quantity: string
}

export interface RecipeStep {
  id: number
  step_num: number
  content: string
  note?: string
  step_image?: string
}

export interface RecipeFeedback {
  id: number
  rating: number
  content: string
  result_image?: string
  created_at: string
  users: Pick<User, 'username' | 'avatar'>
}

export interface Recipe {
  id: number
  title: string
  slug: string
  image_main: string
  description: string
  cooking_time: number
  servings: number
  difficulty: Difficulty
  created_at: string
  users: Pick<User, 'username' | 'avatar'> & { rank?: string }
  tags?: Tag[]
  avg_rating?: number
  review_count?: number
}

export interface RecipeDetail extends Recipe {
  recipe_ingredients: RecipeIngredient[]
  recipe_steps: RecipeStep[]
  recipe_feedbacks: RecipeFeedback[]
}
