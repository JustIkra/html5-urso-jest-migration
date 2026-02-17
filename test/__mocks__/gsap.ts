import { vi } from 'vitest';

const mockTween = {
  kill: vi.fn(),
  ratio: 0,
  progress: vi.fn(() => 0),
  pause: vi.fn(),
  resume: vi.fn(),
  play: vi.fn(),
  reversed: vi.fn(),
  duration: vi.fn(() => 0),
  totalDuration: vi.fn(() => 0),
  time: vi.fn(() => 0),
  timeScale: vi.fn(() => 1),
  eventCallback: vi.fn(),
  targets: vi.fn(() => [{ x: 0 }]),
  vars: {},
};

function createMockTween() {
  return { ...mockTween, kill: vi.fn(), progress: vi.fn(() => 0), pause: vi.fn(), resume: vi.fn(), eventCallback: vi.fn(), targets: vi.fn(() => [{ x: 0 }]) };
}

const gsap = {
  to: vi.fn(() => createMockTween()),
  from: vi.fn(() => createMockTween()),
  fromTo: vi.fn(() => createMockTween()),
  killTweensOf: vi.fn(),
  timeline: vi.fn(() => ({
    to: vi.fn(),
    from: vi.fn(),
    fromTo: vi.fn(),
    kill: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  })),
  set: vi.fn(),
  delayedCall: vi.fn(() => createMockTween()),
  ticker: {
    add: vi.fn(),
    remove: vi.fn(),
    fps: vi.fn(),
  },
  config: vi.fn(),
  registerPlugin: vi.fn(),
};

export default gsap;
export { gsap };
export type Tween = typeof mockTween;
