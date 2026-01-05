'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  const username = formData.get('username') as string
  const password = formData.get('password') as string


  // Lookup email by username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email')
    .eq('username', username)
    .single()


  if (profileError || !profile?.email) {
    return { error: 'Invalid username or password' + profileError?.message || '' }
  }


  // Authenticate using email
  const { error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password
  })

  if (error) {
    return { error: 'Invalid username or password' + error.message }
  }

  redirect('/auth-redirect')
}
