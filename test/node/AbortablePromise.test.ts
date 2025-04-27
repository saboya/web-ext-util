import { beforeEach, describe, expect, test } from 'vitest'
import { AbortablePromise } from '~/util/AbortablePromise'

describe('AbortablePromise', () => {
  let controller: AbortController

  beforeEach(() => {
    controller = new AbortController()
  })

  test('should return original promise when no signal is provided', () => {
    const originalPromise = Promise.resolve(42)
    return expect(AbortablePromise.from(originalPromise)).resolves.toBe(42)
  })

  test('should resolve normally when not aborted', () => {
    const originalPromise = Promise.resolve('success')
    return expect(AbortablePromise.from(originalPromise, controller.signal)).resolves.toBe('success')
  })

  test('should reject when aborted', () => {
    const neverPromise = new Promise(() => {})
    const abortablePromise = AbortablePromise.from(neverPromise, controller.signal)

    controller.abort()

    return expect(abortablePromise).rejects.toBeDefined()
  })

  test('should handle already resolved promises', () => {
    const resolvedPromise = Promise.resolve('already resolved')
    return expect(AbortablePromise.from(resolvedPromise, controller.signal)).resolves.toBe('already resolved')
  })

  test('should handle promise-like objects', () => {
    const promiseLike = Promise.resolve('promise-like resolved') as PromiseLike<string>
    return expect(AbortablePromise.from(promiseLike, controller.signal)).resolves.toBe('promise-like resolved')
  })

  test('should pass abort event with correct target', () => {
    const neverPromise = new Promise(() => {})
    const abortablePromise = AbortablePromise.from(neverPromise, controller.signal)

    controller.abort()

    return expect(abortablePromise).rejects.toSatisfy((event: Event) => {
      return event.target === controller.signal
    })
  })
})
