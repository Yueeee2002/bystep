import { useCallback, useEffect, useState } from 'react'
import { load, save } from '@/utils/storage'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => load(key, initialValue))

  useEffect(() => {
    save(key, value)
  }, [key, value])

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof next === 'function' ? (next as (prev: T) => T)(prev) : next))
  }, [])

  return [value, update] as const
}
