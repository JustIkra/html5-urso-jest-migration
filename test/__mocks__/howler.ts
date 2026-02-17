import { vi } from 'vitest';

export class Howl {
  _volume = 1;
  _src: string[] = [];

  play = vi.fn(() => 1);
  stop = vi.fn();
  pause = vi.fn();
  volume = vi.fn();
  loop = vi.fn();
  mute = vi.fn();
  playing = vi.fn(() => false);
  on = vi.fn();
  off = vi.fn();
  once = vi.fn();
  unload = vi.fn();
  seek = vi.fn(() => 0);
  fade = vi.fn();
  rate = vi.fn();
  duration = vi.fn(() => 0);
  state = vi.fn(() => 'unloaded');

  constructor(_opts: Record<string, unknown>) {
    if (_opts.src) {
      this._src = Array.isArray(_opts.src) ? _opts.src : [_opts.src as string];
    }
  }
}

export const Howler = {
  codecs: vi.fn(() => true),
  _audioUnlocked: true,
  volume: vi.fn(),
  mute: vi.fn(),
  stop: vi.fn(),
  unload: vi.fn(),
};
