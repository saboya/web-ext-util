import { AbortablePromise } from '~/util/AbortablePromise'

export async function elementReady<T extends Node>(
  cb: (records: MutationRecord[]) => T | null,
  target: Node,
  signal?: AbortSignal,
  options: MutationObserverInit = { childList: true },
): Promise<T> {
  const firstCheck = cb([])

  if (firstCheck !== null) {
    return Promise.resolve(firstCheck)
  }

  const eventTarget = new EventTarget()

  const handler: MutationCallback = (records, _) => {
    eventTarget.dispatchEvent(new CustomEvent('newRecords', { detail: records }))
  }

  const observer = new MutationObserver(handler)

  const mutationPromise = new Promise<T>((resolve, _) => {
    eventTarget.addEventListener('newRecords', ((event: CustomEvent<MutationRecord[]>) => {
      const ret = cb(event.detail)

      if (ret === null) {
        return
      }

      resolve(ret)
    }) as EventListener)

    observer.observe(target, options)
  })

  return AbortablePromise.from(mutationPromise, signal).finally(() => observer.disconnect())
}
