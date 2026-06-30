import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { WeatherIcon } from './weather-icon'

describe('WeatherIcon', () => {
  it('#41 selects the icon by group and is_day without emoji', () => {
    // Arrange / Act — clear sky, day vs night
    const day = render(<WeatherIcon code={0} isDay size={40} />)
    const dayIcon = day.container.querySelector('svg')
    const night = render(<WeatherIcon code={0} isDay={false} />)
    const nightIcon = night.container.querySelector('svg')

    // Assert — same group, different day/night rendering
    expect(dayIcon).toHaveAttribute('data-icon-group', 'clear')
    expect(dayIcon).toHaveAttribute('data-icon-day', 'day')
    expect(nightIcon).toHaveAttribute('data-icon-day', 'night')
    // day clear renders a sun (circle), night renders a moon (no circle)
    expect(dayIcon?.querySelector('circle')).not.toBeNull()
    expect(nightIcon?.querySelector('circle')).toBeNull()
  })

  it('#41 maps codes to the correct group and emits no text/emoji', () => {
    // Arrange / Act
    const { container } = render(<WeatherIcon code={61} isDay />)
    const icon = container.querySelector('svg')

    // Assert
    expect(icon).toHaveAttribute('data-icon-group', 'rain')
    expect(icon?.textContent).toBe('')
  })
})
