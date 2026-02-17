class ComponentsLoaderTemplate {
  public styles: Record<string, Record<string, unknown>>;
  public assets: unknown[];
  public objects: unknown[];

  constructor() {
    this.styles = {
      '.loadingTextStyle': {
        fill: 0xFFFFFF,
        fontSize: 32,
        fontWeight: 'bold',
        fontStyle: 'italic',
      },
    };

    this.assets = [];
    this.objects = [];
  }
}

export default ComponentsLoaderTemplate;
