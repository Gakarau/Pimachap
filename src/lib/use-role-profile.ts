'use client'

import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { buildRoleProfile } from '@/lib/auth-profile'
import type { RoleProfile } from '@/lib/rbac'
import { supabase } from '@/lib/supabase'

type RoleProfileState = {
  loading: boolean
  session: Session | null
  profile: RoleProfile | null
}

export function useRoleProfile() {
  const [state, setState] = useState<RoleProfileState>({
    loading: true,
    session: null,
    profile: null,
  })

  useEffect(() => {
    let mounted = true

    async function resolveProfile(session: Session | null) {
      if (session?.access_token) {
        const response = await fetch('/api/platform/me', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (response.ok) {
          const payload = (await response.json()) as { profile: RoleProfile | null }
          return payload.profile
        }
      }

      const { data: userData } = await supabase.auth.getUser()
      return userData.user ? buildRoleProfile(userData.user) : null
    }

    async function load() {
      const { data: sessionData } = await supabase.auth.getSession()
      const profile = await resolveProfile(sessionData.session)

      if (!mounted) {
        return
      }

      setState({
        loading: false,
        session: sessionData.session,
        profile,
      })
    }

    load()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const profile = await resolveProfile(session)

      if (!mounted) {
        return
      }

      setState({
        loading: false,
        session,
        profile,
      })
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return state
}
