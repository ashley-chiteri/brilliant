'use client'

import { useState } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const res = await login(formData)
    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-20">
      <Input name="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Password" required />
      <Button disabled={loading} className="w-full">
        Sign In
      </Button>
    </form>
  )
}
