import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { parseDrawing } from '../utils/fishDrawing'
import { MAX_TOTAL_FISH, MAX_FISH_PER_USER } from '../constants/limits'

export function normalizeFish(fish) {
  if (!fish) return null
  return {
    ...fish,
    drawing: parseDrawing(fish.drawing),
  }
}

export function useFish(onToast) {
  const [fishes, setFishes] = useState([])
  const [loadingFish, setLoadingFish] = useState(true)

  const fetchFishes = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoadingFish(false)
      return
    }

    setLoadingFish(true)
    try {
      const { data, error } = await supabase
        .from('fishes')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching fishes:', error)
        if (onToast) onToast('Failed to load community fish', 'error')
      } else {
        const normalizedList = (data || []).map(normalizeFish).filter(Boolean)
        setFishes(normalizedList)
      }
    } catch (err) {
      console.error('Fetch fishes caught error:', err)
    } finally {
      setLoadingFish(false)
    }
  }, [onToast])

  useEffect(() => {
    fetchFishes()
  }, [fetchFishes])

  const addFish = useCallback(async (fishData, userId) => {
    // 1. Enforce limits on current client state first
    const currentUserFish = fishes.filter(f => f.user_id === userId).length
    if (userId && currentUserFish >= MAX_FISH_PER_USER) {
      const err = new Error(`You've reached your limit!\nYou can have a maximum of ${MAX_FISH_PER_USER} fish.`)
      err.code = 'USER_LIMIT'
      throw err
    }

    if (fishes.length >= MAX_TOTAL_FISH) {
      const err = new Error(`The tank is full!\nThere are already ${MAX_TOTAL_FISH} fish in the tank.`)
      err.code = 'GLOBAL_LIMIT'
      throw err
    }

    const newFishPayload = {
      ...fishData,
      user_id: userId,
      drawing: parseDrawing(fishData.drawing),
    }

    if (!isSupabaseConfigured) {
      // Local fallback for development if Supabase env is empty
      const localFish = {
        ...newFishPayload,
        id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        created_at: new Date().toISOString(),
      }
      setFishes(prev => {
        if (userId && prev.filter(f => f.user_id === userId).length >= MAX_FISH_PER_USER) {
          const err = new Error(`You've reached your limit!\nYou can have a maximum of ${MAX_FISH_PER_USER} fish.`)
          err.code = 'USER_LIMIT'
          throw err
        }
        if (prev.length >= MAX_TOTAL_FISH) {
          const err = new Error(`The tank is full!\nThere are already ${MAX_TOTAL_FISH} fish in the tank.`)
          err.code = 'GLOBAL_LIMIT'
          throw err
        }
        return [...prev, localFish]
      })
      return localFish
    }

    const { data, error } = await supabase
      .from('fishes')
      .insert([newFishPayload])
      .select()
      .single()

    if (error) {
      console.error('Error inserting fish:', error)
      if (error.message?.includes('USER_FISH_LIMIT_REACHED') || error.details?.includes('USER_FISH_LIMIT_REACHED')) {
        const err = new Error(`You've reached your limit!\nYou can have a maximum of ${MAX_FISH_PER_USER} fish.`)
        err.code = 'USER_LIMIT'
        throw err
      }
      if (error.message?.includes('GLOBAL_FISH_LIMIT_REACHED') || error.details?.includes('GLOBAL_FISH_LIMIT_REACHED')) {
        const err = new Error(`The tank is full!\nThere are already ${MAX_TOTAL_FISH} fish in the tank.`)
        err.code = 'GLOBAL_LIMIT'
        throw err
      }
      throw error
    }

    const normalized = normalizeFish(data)
    setFishes(prev => {
      if (prev.some(f => f.id === normalized.id)) return prev
      return [...prev, normalized]
    })

    return normalized
  }, [fishes])

  const deleteFish = useCallback(async (fishId) => {
    // Optimistic removal from state
    setFishes(prev => prev.filter(f => f.id !== fishId))

    if (!isSupabaseConfigured) return

    const { error } = await supabase
      .from('fishes')
      .delete()
      .eq('id', fishId)

    if (error) {
      console.error('Error deleting fish:', error)
      throw error
    }
  }, [])

  return {
    fishes,
    setFishes,
    loadingFish,
    addFish,
    deleteFish,
    refetch: fetchFishes,
  }
}
