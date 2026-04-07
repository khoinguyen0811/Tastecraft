import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users').select('role, username, avatar').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/')

  return { supabase, profile }
}
