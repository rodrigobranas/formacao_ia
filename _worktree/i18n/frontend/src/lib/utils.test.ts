import { cn } from './utils'

describe('cn', () => {
  it('merges conditional classes and resolves Tailwind conflicts', () => {
    const isHidden = false

    expect(cn('px-2', isHidden && 'hidden', 'px-4')).toBe('px-4')
  })
})
