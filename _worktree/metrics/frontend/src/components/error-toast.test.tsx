import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorToast } from './error-toast'

describe('ErrorToast', () => {
  it('#53 shows the message and a retry button when recoverable', () => {
    // Arrange
    const onRetry = vi.fn()

    // Act
    render(<ErrorToast message="Falha de rede." recoverable onRetry={onRetry} />)
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    // Assert — RF25
    expect(screen.getByText('Falha de rede.')).toBeInTheDocument()
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('#53 hides the retry button when the error is not recoverable', () => {
    // Arrange / Act
    render(<ErrorToast message="Cidade não encontrada." recoverable={false} onRetry={vi.fn()} />)

    // Assert
    expect(screen.getByText('Cidade não encontrada.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
  })
})
