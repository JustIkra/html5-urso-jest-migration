class LibMath {
  public intMakeBetween(num: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, num));
  }

  public getRandomInt(max: number): number {
    return this.getRandomIntBetween(0, max);
  }

  public getRandomIntBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public roundToDigits(num: number, digits: number): number | null {
    if (isNaN(num) || isNaN(digits)) return null;

    const pow = Math.pow(10, digits);
    return Math.round(num * pow) / pow;
  }

  public isInt(n: unknown): boolean {
    return Number(n) === n && (n as number) % 1 === 0;
  }

  public isFloat(n: unknown): boolean {
    return Number(n) === n && (n as number) % 1 !== 0;
  }

  public getDecimalsLength(number: number): number {
    return Number(number.toString().split('.')[1]?.length || 0);
  }

  public multiplyFloats(numsArray: number[]): number {
    let result = numsArray.reduce((acc, num) => acc * num);
    return this._processFloat(result, numsArray);
  }

  public addFloats(numsArray: number[]): number {
    let result = numsArray.reduce((acc, num) => acc + num);
    return this._processFloat(result, numsArray);
  }

  public subtractFloats(numsArray: number[]): number {
    let result = numsArray.reduce((acc, num) => acc - num);
    return this._processFloat(result, numsArray);
  }

  public getMaxDecimalsLength(numsArray: number[]): number {
    let maxDecimalLength = 0;

    numsArray.forEach((num) => {
      if (!num) return;

      const currentDecimalLength = this.getDecimalsLength(num);
      maxDecimalLength = Math.max(currentDecimalLength, maxDecimalLength);
    });

    return maxDecimalLength;
  }

  private _processFloat(result: number, numsArray: number[]): number {
    let floatsExist = false;

    numsArray.forEach((element) => {
      if (this.isFloat(element)) {
        floatsExist = true;
      }
    });

    if (floatsExist) {
      result = this._strip(result);
    }

    return result;
  }

  private _strip(number: number): number {
    return Number(number.toPrecision(12));
  }
}

export default LibMath;
