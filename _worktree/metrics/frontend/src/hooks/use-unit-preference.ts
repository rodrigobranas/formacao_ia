import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { UnitSystem } from '@/types/unit-system'
import type { TempUnit } from '@/types/unit-system'
import type { StoredUnitsPreference } from '@/types/unit-system'

const STORAGE_KEY = 'wx:units'

const SYSTEM_BY_TEMP: Record<TempUnit, UnitSystem> = { c: 'metric', f: 'imperial' }
const TEMP_BY_SYSTEM: Record<UnitSystem, TempUnit> = { metric: 'c', imperial: 'f' }

type UnitPreferenceContextValue = {
  unitSystem: UnitSystem
  setUnitSystem: (system: UnitSystem) => void
}

type UnitPreferenceProviderProps = {
  children: ReactNode
}

function readStoredSystem(): UnitSystem {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return 'metric'
    }
    const parsed = JSON.parse(raw) as StoredUnitsPreference
    return SYSTEM_BY_TEMP[parsed?.temp] ?? 'metric'
  } catch {
    return 'metric'
  }
}

function persistSystem(system: UnitSystem): void {
  try {
    const payload: StoredUnitsPreference = { temp: TEMP_BY_SYSTEM[system] }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Silent fallback to in-memory state when storage is unavailable.
  }
}

const UnitPreferenceContext = createContext<UnitPreferenceContextValue | null>(null)

export function UnitPreferenceProvider({ children }: UnitPreferenceProviderProps) {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => readStoredSystem())

  const setUnitSystem = useCallback((system: UnitSystem) => {
    persistSystem(system)
    setUnitSystemState(system)
  }, [])

  const value = useMemo<UnitPreferenceContextValue>(
    () => ({ unitSystem, setUnitSystem }),
    [unitSystem, setUnitSystem],
  )

  return createElement(UnitPreferenceContext.Provider, { value }, children)
}

export function useUnitPreference(): UnitPreferenceContextValue {
  const context = useContext(UnitPreferenceContext)
  if (context === null) {
    throw new Error('useUnitPreference must be used within a UnitPreferenceProvider')
  }
  return context
}

export function UnitPreferenceWrapper({ children }: UnitPreferenceProviderProps) {
  return createElement(UnitPreferenceProvider, null, children)
}
