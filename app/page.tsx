'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      // Fetch role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        router.replace('/login')
        return
      }

      switch (profile.role) {
        case 'admin':
          router.replace('/admin')
          break
        case 'bursar':
          router.replace('/bursar')
          break
        case 'teacher':
          router.replace('/teacher')
          break
        default:
          router.replace('/login')
      }
    }

    checkSession()
  }, [router])

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        Loading Brilliant Talent Kinderstart…
      </p>
    </div>
  )
}
