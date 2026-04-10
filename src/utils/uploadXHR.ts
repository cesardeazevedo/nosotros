import { fromEvent, lastValueFrom, merge, Observable } from 'rxjs'
import { filter, map, take, tap } from 'rxjs'

export type UploadXHRProgressEvent = {
  type: 'progress'
  progress: number
  loaded: number
  total: number
}

export type UploadXHRSuccessEvent<T> = {
  type: 'success'
  status: number
  body: T
  xhr: XMLHttpRequest
}

export type UploadXHREvent<T> = UploadXHRProgressEvent | UploadXHRSuccessEvent<T>

type UploadXHROptions<T> = {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  headers?: Record<string, string>
  body?: XMLHttpRequestBodyInit | null
  parseResponse?: (xhr: XMLHttpRequest) => T
}

export function uploadXHR<T>(options: UploadXHROptions<T>) {
  return new Observable<UploadXHREvent<T>>((subscriber) => {
    const xhr = new XMLHttpRequest()
    xhr.open(options.method, options.url)

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })
    }

    const progressSub = fromEvent<ProgressEvent<EventTarget>>(xhr.upload, 'progress')
      .pipe(
        filter((event) => event.lengthComputable),
        map((event) => {
          return {
            type: 'progress',
            loaded: event.loaded,
            total: event.total,
            progress: Math.round((event.loaded / event.total) * 100),
          } satisfies UploadXHRProgressEvent
        }),
      )
      .subscribe((event) => {
        subscriber.next(event)
      })

    const successSub = fromEvent(xhr, 'load')
      .pipe(
        take(1),
        map(() => {
          const body = options.parseResponse ? options.parseResponse(xhr) : (xhr.responseText as T)
          return {
            type: 'success',
            status: xhr.status,
            body,
            xhr,
          } satisfies UploadXHRSuccessEvent<T>
        }),
      )
      .subscribe({
        next: (event) => {
          subscriber.next(event)
          subscriber.complete()
        },
        error: (error) => {
          subscriber.error(error)
        },
      })

    const errorSub = merge(fromEvent(xhr, 'error'), fromEvent(xhr, 'abort'), fromEvent(xhr, 'timeout'))
      .pipe(take(1))
      .subscribe(() => {
        subscriber.error(new Error('XHR upload failed'))
      })

    xhr.send(options.body || null)

    return () => {
      progressSub.unsubscribe()
      successSub.unsubscribe()
      errorSub.unsubscribe()
      if (xhr.readyState !== 4) {
        xhr.abort()
      }
    }
  })
}

export async function uploadXHRRequest<T>(options: UploadXHROptions<T>, onProgress?: (progress: number) => void) {
  return await lastValueFrom(
    uploadXHR(options).pipe(
      tap((event) => {
        if (event.type === 'progress' && onProgress) {
          onProgress(Math.min(100, Math.max(0, event.progress)))
        }
      }),
      filter((event): event is UploadXHRSuccessEvent<T> => event.type === 'success'),
      take(1),
      map((event) => event),
    ),
  )
}
