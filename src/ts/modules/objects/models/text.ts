import { Text, FillGradient } from 'pixi.js';
import type { ObjectModelParams, ObserverCallback, UrsoEvent } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

interface I18nFacade {
  get: (localeId: string, variables?: Record<string, string>) => string;
}

interface FillGradientColorStop {
  offset: number;
  color: string;
}

class ModulesObjectsModelsText extends ModulesObjectsBaseModel {
  public text!: string | null;
  public localeId!: string | null;
  public localeVariables!: Record<string, string>;

  public lineHeight!: number;
  public fontFamily!: string;
  public fontSize!: number | null;
  public fontStyle!: string;
  public fontWeight!: string;

  public fill!: string | string[];
  public fillCustomColors!: Array<{ position: number; color: string }> | null;
  public stroke!: string;
  public strokeThickness!: number;
  public dropShadow!: boolean | null;
  public dropShadowColor!: string;
  public dropShadowBlur!: number;
  public dropShadowAngle!: number;
  public dropShadowDistance!: number;
  public wordWrap!: boolean | null;
  public wordWrapWidth!: number;
  public leading!: number;
  public letterSpacing!: number;
  public textAlign!: string;
  public fillGradientType!: string;
  public fillGradientStops!: number[] | null;

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.TEXT;
    this._addBaseObject();
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.text = Urso.helper.recursiveGet('text', params, null) as string | null;
    this.localeId = Urso.helper.recursiveGet('localeId', params, null) as string | null;
    this.localeVariables = Urso.helper.recursiveGet('localeVariables', params, {}) as Record<string, string>;

    this.lineHeight = Urso.helper.recursiveGet('lineHeight', params, 0) as number;
    this.fontFamily = Urso.helper.recursiveGet('fontFamily', params, 'Arial') as string;
    this.fontSize = Urso.helper.recursiveGet('fontSize', params, null) as number | null;
    this.fontStyle = Urso.helper.recursiveGet('fontStyle', params, 'normal') as string;
    this.fontWeight = Urso.helper.recursiveGet('fontWeight', params, 'normal') as string;

    this.fill = Urso.helper.recursiveGet('fill', params, '#000000') as string | string[];
    this.fillCustomColors = Urso.helper.recursiveGet('fillCustomColors', params, null) as Array<{ position: number; color: string }> | null;
    this.stroke = Urso.helper.recursiveGet('stroke', params, 'black') as string;
    this.strokeThickness = Urso.helper.recursiveGet('strokeThickness', params, 0) as number;
    this.dropShadow = Urso.helper.recursiveGet('dropShadow', params, null) as boolean | null;
    this.dropShadowColor = Urso.helper.recursiveGet('dropShadowColor', params, '#000000') as string;
    this.dropShadowBlur = Urso.helper.recursiveGet('dropShadowBlur', params, 0) as number;
    this.dropShadowAngle = Urso.helper.recursiveGet('dropShadowAngle', params, 0) as number;
    this.dropShadowDistance = Urso.helper.recursiveGet('dropShadowBlur', params, 0) as number;
    this.wordWrap = Urso.helper.recursiveGet('wordWrap', params, null) as boolean | null;
    this.wordWrapWidth = Urso.helper.recursiveGet('wordWrapWidth', params, 100) as number;
    this.leading = Urso.helper.recursiveGet('leading', params, 0) as number;
    this.letterSpacing = Urso.helper.recursiveGet('letterSpacing', params, 0) as number;
    this.textAlign = Urso.helper.recursiveGet('textAlign', params, 'left') as string;
    this.fillGradientType = Urso.helper.recursiveGet('fillGradientType', params, 'vertical') as string;
    this.fillGradientStops = Urso.helper.recursiveGet('fillGradientStops', params, null) as number[] | null;
  }

  public modifyValue(key: string, val: unknown): unknown {
    switch (key) {
      case 'fill':
        return this._makeFill(val);
      default:
        return val;
    }
  }

  private _calculateFillGradientStops(): number[] {
    const fillArray = this.fill as string[];
    return fillArray.map((_: string, i: number, val: string[]) => {
      if (i === 0) return 0;
      if (i === val.length - 1) return 1;
      return i / (val.length - 1);
    });
  }

  private _makeFill(val: unknown): unknown {
    if (!Array.isArray(val)) return val;

    const fillGradientStops: number[] = (this.fillGradientStops && this.fillGradientStops.length)
      ? this.fillGradientStops
      : this._calculateFillGradientStops();

    const colorStops: FillGradientColorStop[] = fillGradientStops.map((stop: number, index: number) => {
      return {
        offset: stop,
        color: val[index] || val[val.length - 1],
      };
    });

    const gradientParams = {
      type: 'linear' as const,
      start: { x: 0, y: 0 },
      end: this.fillGradientType === 'horizontal' ? { x: 0, y: 1 } : { x: 1, y: 0 },
      colorStops,
      textureSpace: 'local' as const,
    };

    return new (FillGradient as unknown as new (params: unknown) => unknown)(gradientParams);
  }

  private _addBaseObject(): void {
    if (this.localeId) {
      (this as unknown as Record<string, unknown>)._originalModel = {
        ...(this as unknown as Record<string, Record<string, unknown>>)._originalModel,
      };
      const translated = (Urso.i18n as I18nFacade).get(this.localeId, this.localeVariables);
      ((this as unknown as Record<string, Record<string, unknown>>)._originalModel).text = translated;
      this.text = translated;
    }

    const styles = {
      fontFamily: this.fontFamily,
      leading: this.leading,
      align: this.textAlign,
    } as Record<string, unknown>;
    this._baseObject = new Text(this.text ?? '', styles);

    if (this.fillCustomColors) {
      (this._baseObject as unknown as Record<string, unknown>).fillCustomColors = this.fillCustomColors;
    }
  }

  private _newLocaleHandler(): void {
    if (!this.proxyObject) return;

    (this.proxyObject as unknown as Record<string, unknown>).text = (Urso.i18n as I18nFacade).get(this.localeId!, this.localeVariables);
  }

  protected _customDestroy(): void {
    if (this.localeId) {
      this.removeListener(
        Urso.events.MODULES_I18N_NEW_LOCALE_WAS_SET,
        this._newLocaleHandler.bind(this) as ObserverCallback,
      );
    }
  }

  public _subscribeOnce(): void {
    if (this.localeId) {
      this.addListener(
        Urso.events.MODULES_I18N_NEW_LOCALE_WAS_SET,
        this._newLocaleHandler.bind(this) as ObserverCallback,
      );
    }
  }
}

export default ModulesObjectsModelsText;
