export class AbortablePromise {
  public static from<T, P extends Promise<T> | PromiseLike<T>>(
    promise: P,
    signal?: AbortSignal,
  ): P | Promise<Awaited<P>> {
    if (!signal) {
      return promise
    }

    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        signal.addEventListener('abort', (event) => {
          reject(event)
        })
      }),
    ])
  }
}
