'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Like useAnalytics, but also subscribes to Supabase Realtime
 * on the given table(s) and refetches when changes are detected.
 * Debounces rapid changes to avoid hammering the API.
 */
export function useRealtimeAnalytics<T>(
  url: string | null,
  tables: string[],
  opts?: { debounceMs?: number; filter?: string }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const debounceMs = opts?.debounceMs ?? 2000

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url])

  // Debounced refetch — batches rapid DB changes
  const debouncedRefetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchData()
    }, debounceMs)
  }, [fetchData, debounceMs])

  // Initial fetch
  useEffect(() => {
    fetchData()
    return () => abortRef.current?.abort()
  }, [fetchData])

  // Supabase Realtime subscription
  useEffect(() => {
    if (tables.length === 0) return

    const supabase = createClient()
    const channelName = `realtime-analytics-${tables.join('-')}-${Date.now()}`
    const channel = supabase.channel(channelName)

    for (const table of tables) {
      channel.on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table },
        () => {
          debouncedRefetch()
        }
      )
    }

    channel.subscribe()
    channelRef.current = channel

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      channel.unsubscribe()
    }
  }, [tables.join(','), debouncedRefetch])

  return { data, loading, error, refetch: fetchData }
}
