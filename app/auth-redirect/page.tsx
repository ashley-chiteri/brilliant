import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthRedirect() {
  const supabase = createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  switch (profile.role) {
    case 'admin':
      redirect('/admin')
    case 'bursar':
      redirect('/bursar')
    case 'teacher':
      redirect('/teacher')
    default:
      redirect('/login')
  }
}
