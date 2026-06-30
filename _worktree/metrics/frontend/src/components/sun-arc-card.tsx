import { Sunrise } from 'lucide-react'
import { formatTime } from '@/lib/format'

const WIDTH = 260
const HEIGHT = 118
const START_X = 22
const END_X = WIDTH - 22
const BASE_Y = 98
const PEAK_Y = -18

function computeProgress(sunrise: string, sunset: string, now: string): number {
  const rise = Date.parse(sunrise)
  const set = Date.parse(sunset)
  const current = Date.parse(now)
  const progress = set > rise ? (current - rise) / (set - rise) : 0
  return Math.max(0, Math.min(1, progress))
}

function arcPoint(t: number): [number, number] {
  const x = START_X + (END_X - START_X) * t
  const y = (1 - t) * (1 - t) * BASE_Y + 2 * (1 - t) * t * PEAK_Y + t * t * BASE_Y
  return [x, y]
}

type SunArcCardProps = {
  sunrise: string
  sunset: string
  currentTime: string
}

export function SunArcCard({ sunrise, sunset, currentTime }: SunArcCardProps) {
  const progress = computeProgress(sunrise, sunset, currentTime)
  const path = `M${START_X} ${BASE_Y} Q${WIDTH / 2} ${PEAK_Y} ${END_X} ${BASE_Y}`
  const [sunX, sunY] = arcPoint(progress)
  const sunVisible = progress > 0 && progress < 1

  return (
    <section className="wx-card" aria-label="Sol">
      <div className="wx-card-h">
        <Sunrise className="ic" aria-hidden="true" />
        <h3>Sol</h3>
      </div>
      <div className="wx-sun-wrap">
        <svg className="wx-sun-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true">
          <path d={path} fill="none" stroke="var(--wx-border-2)" strokeWidth="1.5" strokeDasharray="3 4" />
          <path d={path} fill="none" stroke="var(--mod)" strokeWidth="2.2" strokeLinecap="round" pathLength="1" strokeDasharray={`${progress.toFixed(3)} 1`} />
          {sunVisible && <circle cx={sunX.toFixed(1)} cy={sunY.toFixed(1)} r="6" fill="var(--mod)" stroke="#0a0e16" strokeWidth="2" />}
        </svg>
        <div className="wx-sun-times">
          <div>
            <span className="lbl">Nascer do sol</span>
            <span className="val">{formatTime(sunrise)}</span>
          </div>
          <div className="r">
            <span className="lbl">Pôr do sol</span>
            <span className="val">{formatTime(sunset)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
