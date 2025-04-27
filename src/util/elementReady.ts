import { AbortablePromise } from '~/util/AbortablePromise'

export async function elementReady<T extends Node>(cb: () => T | null, target: Node, signal?: AbortSignal): Promise<T> {
  const firstCheck = cb()

  if (firstCheck !== null) {
    return Promise.resolve(firstCheck)
  }

  const eventTarget = new EventTarget()

  const handler: MutationCallback = (_, observer) => {
    eventTarget.dispatchEvent(new Event('newRecords'))
  }

  const observer = new MutationObserver(handler)

  const mutationPromise = new Promise<T>((resolve, _) => {
    eventTarget.addEventListener('newRecords', () => {
      const ret = cb()

      if (ret === null) {
        return
      }

      resolve(ret)
    })

    observer.observe(target, { childList: true })
  })

  return AbortablePromise.from(mutationPromise, signal).finally(() => observer.disconnect())
}
