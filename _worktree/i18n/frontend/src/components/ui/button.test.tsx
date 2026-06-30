import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders a button with the requested variant and size classes', () => {
    render(<Button variant="outline" size="sm">Salvar</Button>)

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveClass('h-9', 'border')
  })
})
