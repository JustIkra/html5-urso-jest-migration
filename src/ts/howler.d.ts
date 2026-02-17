declare module 'howler' {
  export class Howl {
    constructor(opts: Record<string, unknown>);
    play(id?: string): number;
    stop(id?: number): this;
    pause(id?: number): this;
    volume(vol?: number, id?: number): number | this;
    loop(loop?: boolean, id?: number): boolean | this;
    mute(muted?: boolean, id?: number): this;
    playing(id?: number): boolean;
    on(event: string, fn: (...args: unknown[]) => void, id?: number): this;
    off(event: string, fn?: (...args: unknown[]) => void, id?: number): this;
    once(event: string, fn: (...args: unknown[]) => void, id?: number): this;
    unload(): void;
    seek(seek?: number, id?: number): number | this;
    fade(from: number, to: number, duration: number, id?: number): this;
    rate(rate?: number, id?: number): number | this;
    duration(id?: number): number;
    state(): string;
  }

  export const Howler: {
    codecs(ext: string): boolean;
    _audioUnlocked: boolean;
    volume(vol?: number): number;
    mute(muted: boolean): void;
    stop(): void;
    unload(): void;
  };
}
