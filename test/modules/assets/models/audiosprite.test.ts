import ModulesAssetsModelsAudiosprite from '../../../../src/ts/modules/assets/models/audiosprite';
import { AssetTypeId } from '../../../../src/ts/types';

describe('ModulesAssetsModelsAudiosprite', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.recursiveGet = vi.fn(
      (_key: string, obj: Record<string, unknown> | undefined, defaultValue?: unknown) => {
        if (obj && _key in obj) return obj[_key];
        return defaultValue;
      },
    );
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should set type to AUDIOSPRITE', () => {
    const sut = new ModulesAssetsModelsAudiosprite({ key: 'sfx', path: '/audio/sfx' });
    expect(sut.type).toBe(AssetTypeId.AUDIOSPRITE);
  });

  it('should have codecs array with ogg, m4a, mp3, wav', () => {
    const sut = new ModulesAssetsModelsAudiosprite({ key: 'sfx', path: '/audio/sfx' });
    expect(sut.codecs).toEqual(['ogg', 'm4a', 'mp3', 'wav']);
  });

  it('should select first supported codec via Howler.codecs', () => {
    // The mock returns true for ogg and mp3, so ogg (first in list) should be chosen
    const sut = new ModulesAssetsModelsAudiosprite({ key: 'sfx', path: '/audio/sfx' });
    // contents should include the selected codec in the sound path
    const soundContent = sut.contents.find(
      (c) => c.type === AssetTypeId.SOUND,
    );
    expect(soundContent).toBeDefined();
    expect((soundContent as Record<string, unknown>).path).toBe('/audio/sfx.ogg');
  });

  it('should generate JSON content with _audiospriteJson key', () => {
    const sut = new ModulesAssetsModelsAudiosprite({ key: 'sfx', path: '/audio/sfx' });
    const jsonContent = sut.contents.find(
      (c) => c.type === AssetTypeId.JSON,
    );
    expect(jsonContent).toBeDefined();
    expect((jsonContent as Record<string, unknown>).key).toBe('sfx_audiospriteJson');
    expect((jsonContent as Record<string, unknown>).path).toBe('/audio/sfx.json');
  });

  it('should generate SOUND content with _audiospriteSound key', () => {
    const sut = new ModulesAssetsModelsAudiosprite({ key: 'sfx', path: '/audio/sfx' });
    const soundContent = sut.contents.find(
      (c) => c.type === AssetTypeId.SOUND,
    );
    expect(soundContent).toBeDefined();
    expect((soundContent as Record<string, unknown>).key).toBe('sfx_audiospriteSound');
  });

  it('should null out key after constructor', () => {
    const sut = new ModulesAssetsModelsAudiosprite({ key: 'sfx', path: '/audio/sfx' });
    expect(sut.key).toBeNull();
  });

  it('should null out path after constructor', () => {
    const sut = new ModulesAssetsModelsAudiosprite({ key: 'sfx', path: '/audio/sfx' });
    expect(sut.path).toBeNull();
  });

  it('should use contents from params if provided', () => {
    const customContents = [{ type: AssetTypeId.JSON, key: 'custom', path: '/custom.json' }];
    // When recursiveGet finds 'contents' in params, it returns params.contents
    const sut = new ModulesAssetsModelsAudiosprite({
      key: 'sfx',
      path: '/audio/sfx',
      contents: customContents,
    });
    expect(sut.contents).toEqual(customContents);
  });
});
