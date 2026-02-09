declare module '@ffmpeg/ffmpeg' {
  type LogEvent = { type?: string; message: string }
  type ProgressEvent = { progress: number; time?: number }
  export class FFmpeg {
    load(options?: Record<string, unknown>): Promise<void>
    writeFile(path: string, data: Uint8Array): Promise<void>
    readFile(path: string): Promise<Uint8Array>
    exec(args: string[], timeout?: number): Promise<number | void>
    deleteFile(path: string): Promise<void>
    on(event: 'log', callback: (event: LogEvent) => void): void
    on(event: 'progress', callback: (event: ProgressEvent) => void): void
    off(event: 'log', callback: (event: LogEvent) => void): void
    off(event: 'progress', callback: (event: ProgressEvent) => void): void
  }
}

declare module '@ffmpeg/util' {
  export function fetchFile(file: File | Blob | string): Promise<Uint8Array>
  export function toBlobURL(url: string, mimeType: string): Promise<string>
}
