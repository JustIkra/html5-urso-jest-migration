import LibDevice from '../../src/ts/lib/device';

describe('LibDevice', () => {
  // ==========================================================================
  // Instance properties
  // ==========================================================================

  describe('default properties', () => {
    it('should have initialized as false by default', () => {
      expect(LibDevice.initialized).toBe(false);
    });

    it('should have deviceReadyAt as 0 by default', () => {
      expect(LibDevice.deviceReadyAt).toBe(0);
    });

    it('should have desktop as false by default', () => {
      expect(LibDevice.desktop).toBe(false);
    });

    it('should have iOS as false by default', () => {
      expect(LibDevice.iOS).toBe(false);
    });

    it('should have android as false by default', () => {
      expect(LibDevice.android).toBe(false);
    });

    it('should have canvas as false by default', () => {
      expect(LibDevice.canvas).toBe(false);
    });

    it('should have webGL as false by default', () => {
      expect(LibDevice.webGL).toBe(false);
    });

    it('should have touch as false by default', () => {
      expect(LibDevice.touch).toBe(false);
    });

    it('should have wheelEvent as null by default', () => {
      expect(LibDevice.wheelEvent).toBe(null);
    });

    it('should have canvasBitBltShift as null by default', () => {
      expect(LibDevice.canvasBitBltShift).toBe(null);
    });

    it('should have pixelRatio as 0 by default', () => {
      expect(LibDevice.pixelRatio).toBe(0);
    });

    it('should have ScreenOrientation object', () => {
      expect(LibDevice.ScreenOrientation).toEqual({
        LANDSCAPE: 'landscape',
        PORTRAIT: 'portrait',
      });
    });
  });

  // ==========================================================================
  // canPlayAudio
  // ==========================================================================

  describe('canPlayAudio', () => {
    it('should return false when codec is not supported', () => {
      expect(LibDevice.canPlayAudio('mp3')).toBe(false);
    });

    it('should return true when mp3 is supported', () => {
      LibDevice.mp3 = true;
      expect(LibDevice.canPlayAudio('mp3')).toBe(true);
      LibDevice.mp3 = false;
    });

    it('should return true for ogg when ogg is supported', () => {
      LibDevice.ogg = true;
      expect(LibDevice.canPlayAudio('ogg')).toBe(true);
      LibDevice.ogg = false;
    });

    it('should return true for ogg when opus is supported', () => {
      LibDevice.opus = true;
      expect(LibDevice.canPlayAudio('ogg')).toBe(true);
      LibDevice.opus = false;
    });

    it('should return true for m4a when supported', () => {
      LibDevice.m4a = true;
      expect(LibDevice.canPlayAudio('m4a')).toBe(true);
      LibDevice.m4a = false;
    });

    it('should return true for opus when supported', () => {
      LibDevice.opus = true;
      expect(LibDevice.canPlayAudio('opus')).toBe(true);
      LibDevice.opus = false;
    });

    it('should return true for wav when supported', () => {
      LibDevice.wav = true;
      expect(LibDevice.canPlayAudio('wav')).toBe(true);
      LibDevice.wav = false;
    });

    it('should return true for webm when supported', () => {
      LibDevice.webm = true;
      expect(LibDevice.canPlayAudio('webm')).toBe(true);
      LibDevice.webm = false;
    });
  });

  // ==========================================================================
  // canPlayVideo
  // ==========================================================================

  describe('canPlayVideo', () => {
    it('should return false when format is not supported', () => {
      expect(LibDevice.canPlayVideo('mp4')).toBe(false);
    });

    it('should return true for mp4 when mp4Video is supported', () => {
      LibDevice.mp4Video = true;
      expect(LibDevice.canPlayVideo('mp4')).toBe(true);
      LibDevice.mp4Video = false;
    });

    it('should return true for mp4 when h264Video is supported', () => {
      LibDevice.h264Video = true;
      expect(LibDevice.canPlayVideo('mp4')).toBe(true);
      LibDevice.h264Video = false;
    });

    it('should return true for webm when webmVideo is supported', () => {
      LibDevice.webmVideo = true;
      expect(LibDevice.canPlayVideo('webm')).toBe(true);
      LibDevice.webmVideo = false;
    });

    it('should return true for ogg when oggVideo is supported', () => {
      LibDevice.oggVideo = true;
      expect(LibDevice.canPlayVideo('ogg')).toBe(true);
      LibDevice.oggVideo = false;
    });

    it('should return true for ogv when oggVideo is supported', () => {
      LibDevice.oggVideo = true;
      expect(LibDevice.canPlayVideo('ogv')).toBe(true);
      LibDevice.oggVideo = false;
    });

    it('should return true for mpeg when hlsVideo is supported', () => {
      LibDevice.hlsVideo = true;
      expect(LibDevice.canPlayVideo('mpeg')).toBe(true);
      LibDevice.hlsVideo = false;
    });
  });

  // ==========================================================================
  // isConsoleOpen
  // ==========================================================================

  describe('isConsoleOpen', () => {
    it('should return false by default', () => {
      expect(LibDevice.isConsoleOpen()).toBe(false);
    });
  });

  // ==========================================================================
  // isAndroidStockBrowser
  // ==========================================================================

  describe('isAndroidStockBrowser', () => {
    it('should return false for non-Android user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        configurable: true,
      });
      expect(LibDevice.isAndroidStockBrowser()).toBe(false);
    });
  });

  // ==========================================================================
  // whenReady
  // ==========================================================================

  describe('whenReady', () => {
    it('should call callback immediately when deviceReadyAt is set', () => {
      const originalReadyAt = LibDevice.deviceReadyAt;
      LibDevice.deviceReadyAt = Date.now();
      const cb = vi.fn();
      LibDevice.whenReady(cb);
      expect(cb).toHaveBeenCalledWith(LibDevice);
      LibDevice.deviceReadyAt = originalReadyAt;
    });
  });
});
