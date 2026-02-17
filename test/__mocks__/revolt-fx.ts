import { vi } from 'vitest';
import { Container } from './pixi';

class MockEmitter {
  children: unknown[] = [];
  init = vi.fn(() => this);
  start = vi.fn(() => this);
  stop = vi.fn((_immediate?: boolean) => this);
  recycle = vi.fn(() => this);
  update = vi.fn(() => this);
  completed = false;
  active = true;
  on = {
    completed: {
      add: vi.fn(),
    },
  };
}

export class FX {
  maxParticles = 5000;
  particleCount = 0;

  initBundle = vi.fn(() => Promise.resolve());
  getParticleEmitter = vi.fn(() => new MockEmitter());
  update = vi.fn();
  clearCache = vi.fn();
  dispose = vi.fn();
}

export default FX;
