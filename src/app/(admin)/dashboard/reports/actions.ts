
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function sendNotification(admin: ReturnType<typeof createAdminClient>, userId: string, payload: {
  type: string; title: string; body: string; link?: string
}) {
  await admin.from('notifications').insert({ user_id: userId, ...payload })
}

export async function updateReportStatus(id: number, status: 'reviewed' | 'dismissed') {
  const admin = createAdminClient()

  // Lấy thông tin report + recipe + reporter
  const { data: report } = await admin
    .from('recipe_reports')
    .select('user_id, recipe_id, reason, recipes ( title, slug, user_id )')
    .eq('id', id)
    .single()

  const { error } = await admin.from('recipe_reports').update({ status }).eq('id', id)
  if (error) return { error: error.message }

  if (report) {
    const recipe = (report as any).recipes
    const reporterUserId = report.user_id
    const recipeOwnerId = recipe?.user_id

    if (status === 'reviewed') {
      // Thông báo cho người báo cáo
      if (reporterUserId) {
        await sendNotification(admin, reporterUserId, {
          type: 'report_actioned',
          title: 'Báo cáo của bạn đã được xem xét',
          body: `Báo cáo về công thức "${recipe?.title}" đã được đội ngũ kiểm duyệt xử lý.`,
          link: recipe?.slug ? `/recipes/${recipe.slug}` : undefined,
        })
      }
    } else if (status === 'dismissed') {
      // Thông báo cho người báo cáo biết báo cáo bị bỏ qua
      if (reporterUserId) {
        await sendNotification(admin, reporterUserId, {
          type: 'report_actioned',
          title: 'Báo cáo của bạn đã được xem xét',
          body: `Sau khi xem xét, báo cáo về công thức "${recipe?.title}" không vi phạm chính sách của chúng tôi.`,
          link: recipe?.slug ? `/recipes/${recipe.slug}` : undefined,
        })
      }
    }
  }

  revalidatePath('/dashboard/reports')
  return { success: true }
}

export async function forceHideRecipe(reportId: number, recipeId: number) {
  const admin = createAdminClient()

  // Buộc ẩn công thức
  const { error } = await admin
    .from('recipes')
    .update({ is_active: false, forced_hidden: true })
    .eq('id', recipeId)

  if (error) return { error: error.message }

  // Cập nhật report thành reviewed
  await admin.from('recipe_reports').update({ status: 'reviewed' }).eq('id', reportId)

  // Lấy thông tin để gửi thông báo
  const { data: recipe } = await admin
    .from('recipes')
    .select('title, slug, user_id')
    .eq('id', recipeId)
    .single()

  const { data: report } = await admin
    .from('recipe_reports')
    .select('user_id')
    .eq('id', reportId)
    .single()

  if (recipe) {
    // Thông báo cho chủ công thức
    if (recipe.user_id) {
      await sendNotification(admin, recipe.user_id, {
        type: 'recipe_hidden',
        title: 'Công thức của bạn đã bị ẩn',
        body: `Công thức "${recipe.title}" đã bị ẩn do vi phạm chính sách cộng đồng của Bếp Nhà Làm.`,
        link: `/recipes/${recipe.slug}`,
      })
    }
    // Thông báo cho người báo cáo
    if (report?.user_id) {
      await sendNotification(admin, report.user_id, {
        type: 'report_actioned',
        title: 'Báo cáo của bạn đã được xử lý',
        body: `Công thức "${recipe.title}" đã bị ẩn sau khi xem xét báo cáo của bạn.`,
      })
    }
  }

  revalidatePath('/dashboard/reports')
  revalidatePath('/dashboard/recipes')
  return { success: true }
}
