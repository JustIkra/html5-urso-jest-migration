import type { ComponentCommon } from '../../types';

interface TextObject {
  text: string;
}

class ComponentsDebugFps {
  private _coordsText: TextObject | null = null;
  public lastUpdateTime = 0;
  public frames = 0;

  public common!: ComponentCommon;

  constructor() {
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
  }

  create(): boolean {
    this._coordsText = this.common.findOne!('^debugFps') as TextObject | null;
    this.update();
    return true;
  }

  update(): void {
    const currentTime = Urso.time.get();
    this.frames++;

    if (currentTime - this.lastUpdateTime < 1000)
      return;

    const fps = Math.round(1000 * this.frames / (currentTime - this.lastUpdateTime));
    this.lastUpdateTime = currentTime;
    this.frames = 0;

    const fpsData = Urso.scenes.getFpsData();
    this._coordsText!.text = `fps: ${fps}, sceneFps: ${fpsData.fps}, limit: ${fpsData.limit}`;
  }
}

export default ComponentsDebugFps;
