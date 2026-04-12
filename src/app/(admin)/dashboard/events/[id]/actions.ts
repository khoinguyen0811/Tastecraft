'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function removeParticipant(participantId: number, eventId: string) {
  const admin = createAdminClient()
  await admin.from('event_participants').delete().eq('id', participantId)
  revalidatePath(`/dashboard/events/${eventId}`)
  return { success: true }
}
