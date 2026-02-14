'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Like useAnalytics, but auto-polls on an interval.
 * No Supabase Realtime config needed.
 */
export function useRealtimeAnalytics<T>(
  url: string | null,
  _tables: string[],
  opts?: { pollIntervalMs?: number }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const pollInterval = opts?.pollIntervalMs ?? 12000

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

  // Initial fetch
  useEffect(() => {
    fetchData()
    return () => abortRef.current?.abort()
  }, [fetchData])

  // Auto-poll
  useEffect(() => {
    if (!url) return
    const id = setInterval(fetchData, pollInterval)
    return () => clearInterval(id)
  }, [fetchData, pollInterval, url])

  return { data, loading, error, refetch: fetchData }
}
