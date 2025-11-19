import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })

  it('renders the game interface', () => {
    const { container } = render(<App />)
    // Verify the app renders something
    expect(container.firstChild).toBeTruthy()
  })
})
