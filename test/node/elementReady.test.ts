/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, test } from 'vitest'
import { elementReady } from '~/util/elementReady'

describe('elementReady', () => {
  beforeEach(() => {
    // Clean up the DOM before each test
    document.body.innerHTML = ''
  })

  test('should resolve immediately if element is already present', async () => {
    const div = document.createElement('div')
    div.id = 'test'
    document.body.appendChild(div)

    const element = await elementReady(() => document.getElementById('test'), document.body)

    expect(element).toBe(div)
  })

  test('should resolve when element appears later', async () => {
    const promise = elementReady(() => document.getElementById('test'), document.body)

    // Add element after a small delay
    setTimeout(() => {
      const div = document.createElement('div')
      div.id = 'test'
      document.body.appendChild(div)
    }, 0)

    const element = await promise
    expect(element).toBeDefined()
    expect(element.id).toBe('test')
  })

  test('should handle abort signal', async () => {
    const controller = new AbortController()

    // Create a promise that we can await
    const promise = elementReady(() => document.getElementById('nonexistent'), document.body, controller.signal)

    // We need to abort after the promise is created but before it resolves
    setTimeout(() => {
      controller.abort()
    }, 0)

    await expect(promise).rejects.toBeDefined()
  })

  test('should handle multiple DOM mutations', async () => {
    const promise = elementReady(() => document.getElementById('target'), document.body)

    // Add the target element after other elements
    setTimeout(() => {
      document.body.appendChild(document.createElement('span'))
      document.body.appendChild(document.createElement('p'))

      const div = document.createElement('div')
      div.id = 'target'
      document.body.appendChild(div)
    }, 0)

    const element = await promise
    expect(element).toBeDefined()
    expect((element as HTMLElement).id).toBe('target')
  })

  test('should cleanup mutation observer after resolution', async () => {
    let foundCount = 0
    const countingCallback = () => {
      const element = document.getElementById('test')
      if (element) {
        foundCount++
      }
      return element
    }

    const promise = elementReady(countingCallback, document.body)

    // First mutation to resolve the promise
    const div = document.createElement('div')
    div.id = 'test'
    document.body.appendChild(div)

    await promise
    const countAfterResolution = foundCount

    // Perform another mutation after resolution
    document.body.appendChild(document.createElement('div'))
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Count should not increase after resolution
    expect(foundCount).toBe(countAfterResolution)
    expect(foundCount).toBe(1) // We should only have one successful find
  })

  test('should cleanup mutation observer after abortion', async () => {
    let foundCount = 0
    const countingCallback = () => {
      const element = document.getElementById('nonexistent')
      if (element) {
        foundCount++
      }
      return element
    }

    const controller = new AbortController()
    const promise = elementReady(countingCallback, document.body, controller.signal)

    // Let a mutation happen before abort
    document.body.appendChild(document.createElement('div'))
    await new Promise((resolve) => setTimeout(resolve, 0))
    const countBeforeAbort = foundCount

    // Abort and verify mutation observer is cleaned up
    controller.abort()
    await expect(promise).rejects.toBeDefined()

    // Try another mutation after abort
    document.body.appendChild(document.createElement('div'))
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Count should remain at 0 since element was never found
    expect(foundCount).toBe(countBeforeAbort)
    expect(foundCount).toBe(0)
  })
})
