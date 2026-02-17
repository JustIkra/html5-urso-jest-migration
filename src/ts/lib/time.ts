class LibTime {
  public get(date?: Date): number {
    if (!date) date = new Date();
    return date.getTime();
  }

  public getUnixtime(date?: Date): number {
    if (!date) date = new Date();
    const unixtimeMs = date.getTime();
    return ~~(unixtimeMs / 1e3);
  }
}

export default LibTime;
