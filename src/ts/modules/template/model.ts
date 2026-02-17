import type { StylesMap, AssetModelParams, ObjectModelParams } from '../../types';

class ModulesTemplateModel {
  public styles: StylesMap = {};
  public assets: Partial<AssetModelParams>[] = [];
  public objects: Partial<ObjectModelParams>[] = [];
  public components: unknown[] = [];
  public _templatePath: string | null = null;
}

export default ModulesTemplateModel;
