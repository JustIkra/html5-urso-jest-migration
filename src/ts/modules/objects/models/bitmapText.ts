import { BitmapText } from 'pixi.js';
import type { ObjectModelParams, ObserverCallback } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

interface I18nFacade {
  get: (localeId: string, variables?: Record<string, string>) => string;
}

class ModulesObjectsModelsBitmapText extends ModulesObjectsBaseModel {
  public text!: string | null;
  public localeId!: string | null;
  public localeVariables!: Record<string, string>;
  public fontName!: string | null;
  public fontSize!: number | null;
  public letterSpacing!: number;

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.BITMAPTEXT;
    this._addBaseObject();
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.text = Urso.helper.recursiveGet('text', params, null) as string | null;
    this.localeId = Urso.helper.recursiveGet('localeId', params, null) as string | null;
    this.localeVariables = Urso.helper.recursiveGet('localeVariables', params, {}) as Record<string, string>;

    this.fontName = Urso.helper.recursiveGet('fontName', params, null) as string | null;
    this.fontSize = Urso.helper.recursiveGet('fontSize', params, null) as number | null;
    this.letterSpacing = Urso.helper.recursiveGet('letterSpacing', params, 0) as number;
  }

  private _addBaseObject(): void {
    if (this.localeId) {
      const translated = (Urso.i18n as I18nFacade).get(this.localeId, this.localeVariables);
      ((this as unknown as Record<string, Record<string, unknown>>)._originalModel).text = translated;
      this.text = translated;
    }

    this._baseObject = new BitmapText({
      text: this.text ?? '',
      style: {
        fontFamily: this.fontName ?? undefined,
        fontSize: this.fontSize ?? undefined,
        letterSpacing: this.letterSpacing,
      },
    });
  }

  private _newLocaleHandler(): void {
    if (!this.proxyObject) return;

    (this.proxyObject as unknown as Record<string, unknown>).text = (Urso.i18n as I18nFacade).get(this.localeId!, this.localeVariables);
  }

  protected _customDestroy(): void {
    if (this.localeId) {
      this.removeListener(
        Urso.events.MODULES_I18N_NEW_LOCALE_WAS_SET as string,
        this._newLocaleHandler.bind(this) as ObserverCallback,
      );
    }
  }

  public _subscribeOnce(): void {
    if (this.localeId) {
      this.addListener(
        Urso.events.MODULES_I18N_NEW_LOCALE_WAS_SET as string,
        this._newLocaleHandler.bind(this) as ObserverCallback,
      );
    }
  }
}

export default ModulesObjectsModelsBitmapText;
