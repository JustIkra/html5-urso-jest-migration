import type { AssetTypeId } from '../../types';

class ModulesAssetsBaseModel {
  public simpleClass: boolean = true;

  public id!: string | null;
  public type!: AssetTypeId | null;
  public key!: string | null;
  public path!: string | null;
  public useBinPath!: boolean;
  public loadingGroup!: string | null;
  public placeHolder!: unknown;
  public _templatePath: string | null = null;

  constructor(params: Record<string, unknown>) {
    this.simpleClass = true;

    this.setupParams(params);
    this._templatePath = null;
  }

  public setupParams(params: Record<string, unknown>): void {
    this.id = Urso.helper.recursiveGet('id', params, null) as string | null;
    this.type = Urso.helper.recursiveGet('type', params, null) as AssetTypeId | null;
    this.key = Urso.helper.recursiveGet('key', params, null) as string | null;
    this.path = Urso.helper.recursiveGet('path', params, null) as string | null;
    this.useBinPath = (Urso.helper.recursiveGet('useBinPath', params, false) as boolean) ||
      (Urso.config as Record<string, unknown>).mode !== 'development';
    this.loadingGroup = Urso.helper.recursiveGet('loadingGroup', params, null) as string | null;
    this.placeHolder = Urso.helper.recursiveGet('placeHolder', params, null);
  }
}

export default ModulesAssetsBaseModel;
