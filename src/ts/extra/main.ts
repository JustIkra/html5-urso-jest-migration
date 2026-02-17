declare const PIXI: {
  ExtensionType: { LoadParser: string };
  extensions: { add: (ext: unknown) => void };
};
declare const gsap: unknown;
declare const Howler: unknown;
declare const Howl: unknown;

interface SoundAssetLoader {
  extension: {
    type: string;
    name: string;
    priority: number;
  };
  test: (url: string) => boolean;
  load: (url: string) => Promise<ArrayBuffer>;
}

const SoundAsset: SoundAssetLoader = {
  extension: {
    type: PIXI.ExtensionType.LoadParser,
    name: 'sound-asset-loader',
    priority: 100,
  },

  test(url: string): boolean {
    return url.endsWith('.mp3') || url.endsWith('.ogg') || url.endsWith('.wav');
  },

  async load(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.arrayBuffer();
  },
};

PIXI.extensions.add(SoundAsset);

(window as unknown as Record<string, unknown>).PIXI = PIXI;
(window as unknown as Record<string, unknown>).gsap = gsap;
(window as unknown as Record<string, unknown>).UrsoUtils = {
  Howler,
  Howl,
  gsap,
  PIXI,
};

export default {};
