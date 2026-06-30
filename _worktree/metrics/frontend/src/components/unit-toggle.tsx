import { useMemo } from 'react'
import { useUnitPreference } from '@/hooks/use-unit-preference'
import type { UnitSystem } from '@/types/unit-system'

const SEGMENTS: ReadonlyArray<{ system: UnitSystem; label: string }> = [
  { system: 'metric', label: '°C' },
  { system: 'imperial', label: '°F' },
]

type UnitSegmentProps = {
  label: string
  selected: boolean
  onSelect: () => void
}

function UnitSegment({ label, selected, onSelect }: UnitSegmentProps) {
  const className = useMemo(() => (selected ? 'on' : undefined), [selected])

  return (
    <button type="button" className={className} aria-pressed={selected} onClick={onSelect}>
      {label}
    </button>
  )
}

export function UnitToggle() {
  const { unitSystem, setUnitSystem } = useUnitPreference()

  return (
    <div className="wx-units" role="group" aria-label="Unidade de temperatura">
      {SEGMENTS.map((segment) => (
        <UnitSegment
          key={segment.system}
          label={segment.label}
          selected={segment.system === unitSystem}
          onSelect={() => setUnitSystem(segment.system)}
        />
      ))}
    </div>
  )
}
