import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { ingredients, servings } = await req.json()

    if (!ingredients?.length) {
      return NextResponse.json({ error: 'Không có nguyên liệu' }, { status: 400 })
    }

    const ingredientList = ingredients
      .map((ing: { name: string; quantity: string }) => `- ${ing.quantity} ${ing.name}`)
      .join('\n')

    const prompt = `Bạn là chuyên gia dinh dưỡng. Hãy ước tính thông tin dinh dưỡng cho công thức nấu ăn sau.

Nguyên liệu (cho ${servings} người):
${ingredientList}

Hãy trả về JSON với format sau (không có markdown, chỉ JSON thuần):
{
  "total_calories": <số calo tổng>,
  "per_serving_calories": <số calo mỗi phần>,
  "protein_g": <protein gram mỗi phần>,
  "carbs_g": <carbs gram mỗi phần>,
  "fat_g": <fat gram mỗi phần>,
  "fiber_g": <chất xơ gram mỗi phần>,
  "summary": "<nhận xét ngắn về giá trị dinh dưỡng bằng tiếng Việt, tối đa 1 câu>"
}`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Parse JSON từ response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid response format')

    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Calories API error:', err)
    return NextResponse.json({ error: err.message ?? 'Lỗi tính toán' }, { status: 500 })
  }
}
