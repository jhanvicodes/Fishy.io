import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { normalizeFish } from './useFish'

export function useFishRealtime(setFishes, onToast) {
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('fishes-realtime-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'fishes' },
        (payload) => {
          if (!payload.new) return
          const normalized = normalizeFish(payload.new)
          if (!normalized) return

          setFishes(prev => {
            const existingIdx = prev.findIndex(f => f.id === normalized.id)
            if (existingIdx >= 0) {
              const clone = [...prev]
              clone[existingIdx] = normalized
              return clone
            }
            return [...prev, normalized]
          })

          if (onToast) {
            onToast(`${normalized.name || 'A fish'} joined the tank! 🐟`, 'success')
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'fishes' },
        (payload) => {
          if (!payload.old?.id) return
          setFishes(prev => prev.filter(f => f.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [setFishes, onToast])
}
