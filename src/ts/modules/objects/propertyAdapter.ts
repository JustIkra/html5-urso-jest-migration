import { AlignX, AlignY, ObjectTypeId, StretchingType } from '../../types';
import type ModulesObjectsBaseModel from './baseModel';

type PropertyHandler = (object: AdaptableObject) => void;

interface ParentToChildDep {
  children: string[];
}

/**
 * Subset of ModulesObjectsBaseModel properties used by the property adapter.
 * Using a local interface avoids circular import issues and keeps the adapter
 * loosely coupled to the exact model class.
 */
interface AdaptableObject {
  x: number | string;
  y: number | string;
  anchorX: number;
  anchorY: number;
  scaleX: number;
  scaleY: number;
  alignX: AlignX | string;
  alignY: AlignY | string;
  width: number | string | null;
  height: number | string | null;
  angle: number;
  stretchingType: StretchingType | string | null;
  type: ObjectTypeId | null;
  parent: AdaptableObject | null;
  _baseObject: PixiLikeObject | null;
  contents?: AdaptableObject[];
  /** Index signature required: adapter reads/writes dynamic model properties by name */
  [key: string]: unknown;
}

interface PixiLikeObject {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  scale: { x: number; y: number };
  anchor?: { x: number; y: number };
  /** Index signature required: pixi Container exposes dynamic properties */
  [key: string]: unknown;
}

class ModulesObjectsPropertyAdapter {
  public readonly singleton: boolean = true;

  private _dependencies: Record<string, PropertyHandler>;
  private _parentToChildDependencies: Record<string, ParentToChildDep>;
  private _parentTypes: ObjectTypeId[];
  private _typesWithoutAnchor: ObjectTypeId[];

  constructor() {
    this._dependencies = {
      'x': this._updateHorizontal.bind(this),
      'y': this._updateVertical.bind(this),
      'anchorX': this._updateHorizontal.bind(this),
      'anchorY': this._updateVertical.bind(this),
      'scaleX': this._adaptScaleX.bind(this),
      'scaleY': this._adaptScaleY.bind(this),
      'alignX': this._updateHorizontal.bind(this),
      'alignY': this._updateVertical.bind(this),
      'width': this._updateHorizontal.bind(this),
      'height': this._updateVertical.bind(this),
      'angle': this._updateAngle.bind(this),
      'stretchingType': this._adaptStretchingType.bind(this),
      'parent': this._parentChangeHandler.bind(this),
    };

    this._parentToChildDependencies = {
      'width': { children: ['width'] },
      'height': { children: ['height'] },
      'anchorX': { children: ['x'] },
      'anchorY': { children: ['y'] },
      'stretchingType': { children: ['width', 'height'] },
    };

    this._parentTypes = [
      ObjectTypeId.COMPONENT,
      ObjectTypeId.CONTAINER,
      ObjectTypeId.DRAGCONTAINER,
      ObjectTypeId.GROUP,
      ObjectTypeId.SCROLLBOX,
      ObjectTypeId.SLIDER,
      ObjectTypeId.SPINE,
      ObjectTypeId.WORLD,
    ];

    this._typesWithoutAnchor = [
      ObjectTypeId.CHECKBOX,
      ObjectTypeId.EMITTER,
      ObjectTypeId.EMITTERFX,
      ObjectTypeId.GRAPHICS,
      ObjectTypeId.HITAREA,
      ObjectTypeId.MASK,
      ObjectTypeId.NINESLICEPLANE,
      ObjectTypeId.SLIDER,
      ObjectTypeId.SPINE,
      ObjectTypeId.TEXTINPUT,
      ObjectTypeId.WORLD,
    ];
  }

  public isAdaptiveProperty(property: string): boolean {
    return Object.keys(this._dependencies).includes(property);
  }

  public propertyChangeHandler(object: AdaptableObject, propertyName: string): void {
    this._adaptProperty(object, propertyName);
    this._adaptChildProperties(object, propertyName);
  }

  private _adaptProperty(object: AdaptableObject, propertyName: string): void {
    if (this._dependencies[propertyName]) {
      this._dependencies[propertyName](object);
    }
  }

  private _updateHorizontal(object: AdaptableObject): void {
    let x = this._getXAsNumber(object);
    x += this._adaptAnchorX(object);
    x += this._adaptAlignX(object);

    object._baseObject!.x = x;

    this._adaptWidth(object);
  }

  private _updateAngle(object: AdaptableObject): void {
    object._baseObject!.angle = object.angle;

    if (!this._canBeParent(object)) {
      return;
    }

    this._updateHorizontal(object);
    this._updateVertical(object);
  }

  private _updateVertical(object: AdaptableObject): void {
    let y = this._getYAsNumber(object);
    y += this._adaptAnchorY(object);
    y += this._adaptAlignY(object);
    object._baseObject!.y = y;

    this._adaptHeight(object);
  }

  private _setPropertyWithoutAdaption(object: AdaptableObject, propertyName: string, value: unknown): void {
    object[propertyName] = value;
  }

  private _adaptChildProperties(object: AdaptableObject, propertyName: string): void {
    const dep = this._parentToChildDependencies[propertyName];
    const children = dep ? dep.children : undefined;
    const objectHasChildren = this._canBeParent(object) && Object.prototype.hasOwnProperty.call(object, 'contents');

    if (!children || !objectHasChildren) {
      return;
    }

    for (const dependency of children) {
      for (const child of object.contents!) {
        this.propertyChangeHandler(child, dependency);
      }
    }
  }

  private _parentChangeHandler(child: AdaptableObject): void {
    if (child.parent == null) {
      return;
    }

    for (const propertyName of this._propertiesDependentOnParent()) {
      this.propertyChangeHandler(child, propertyName);
    }
  }

  private _propertiesDependentOnParent(): string[] {
    const properties: string[] = [];

    for (const propertyName of Object.keys(this._parentToChildDependencies)) {
      const { children } = this._parentToChildDependencies[propertyName];

      if (children) {
        for (const dependency of children) {
          properties.push(dependency);
        }
      }
    }

    return properties;
  }

  private _adaptAnchorX(object: AdaptableObject): number {
    if (typeof object.anchorX !== 'number' || object.anchorX < 0 || object.anchorX > 1) {
      Urso.logger.error('AnchorX value is not valid!', object);
    }

    if (this._canBeParent(object) && !this._typesWithoutAnchor.includes(object.type!)) {
      if (object.anchorX === 0) {
        return 0;
      }

      if (object.angle) {
        return this._getAnchorOffsetByAngle(object, 'x');
      }

      const objectWidth = this._getWidthAsNumber(object);
      return -objectWidth * object.anchorX;
    } else if (!this._typesWithoutAnchor.includes(object.type!)) {
      const pixiObject = object._baseObject!;
      pixiObject.anchor!.x = object.anchorX;
    } else {
      Urso.logger.warn('AnchorX value cannot be used with this object type !', object);
    }

    return 0;
  }

  private _adaptAnchorY(object: AdaptableObject): number {
    if (typeof object.anchorY !== 'number' || object.anchorY < 0 || object.anchorY > 1) {
      Urso.logger.error('AnchorY value is not valid!', object);
    }

    if (this._canBeParent(object) && !this._typesWithoutAnchor.includes(object.type!)) {
      if (object.anchorY === 0) {
        return 0;
      }

      if (object.angle) {
        return this._getAnchorOffsetByAngle(object, 'y');
      }

      const objectHeight = this._getHeightAsNumber(object);
      return -objectHeight * object.anchorY;
    } else if (!this._typesWithoutAnchor.includes(object.type!)) {
      const pixiObject = object._baseObject!;
      pixiObject.anchor!.y = object.anchorY;
    } else {
      Urso.logger.warn('AnchorY value cannot be used with this object type !', object);
    }

    return 0;
  }

  private _getAnchorOffsetByAngle(object: AdaptableObject, side: 'x' | 'y'): number {
    const objectWidth = this._getWidthAsNumber(object);
    const objectHeight = this._getHeightAsNumber(object);
    const xCatet = objectWidth * object.anchorX;
    const yCatet = objectHeight * object.anchorY;
    const offsetRadius = Math.sqrt(Math.pow(xCatet, 2) + Math.pow(yCatet, 2));
    const angleRadian = Math.atan(xCatet / yCatet);
    const angle = Urso.helper.getAngle(angleRadian);
    const offsetAngle = object.angle + angle;
    const offsetFunction = side === 'x' ? 'cos' : 'sin';
    const angleOffset = -offsetRadius * Math[offsetFunction](Urso.helper.getRadian(offsetAngle));

    return angleOffset;
  }

  // CRITICAL: false->null migration.
  // Old JS: `typeof object.width !== 'boolean'` meant "width is set (not false)".
  // New TS: `object.width !== null` means "width is set (not null)".
  private _adaptScaleX(object: AdaptableObject): void {
    if (object.scaleX !== 1 && object.width !== null) {
      Urso.logger.error('ScaleX value cannot be set. Width already used!!');
      this._setPropertyWithoutAdaption(object, 'scaleX', 1);
      return;
    }

    if (typeof object.scaleX === 'number') {
      const pixiObject = object._baseObject!;
      pixiObject.scale.x = object.scaleX;
    } else {
      Urso.logger.error('ScaleX value is not valid!');
    }
  }

  private _adaptScaleY(object: AdaptableObject): void {
    if (object.scaleY !== 1 && object.height !== null) {
      Urso.logger.error('ScaleY value cannot be set. Height already used!!');
      this._setPropertyWithoutAdaption(object, 'scaleY', 1);
      return;
    }

    if (typeof object.scaleY === 'number' && object.scaleY >= 0) {
      const pixiObject = object._baseObject!;
      pixiObject.scale.y = object.scaleY;
    } else {
      Urso.logger.error('ScaleY value is not valid!');
    }
  }

  private _adaptAlignX(object: AdaptableObject): number {
    if (typeof object.alignX !== 'string') {
      Urso.logger.error('AlignX value is not string!');
      return 0;
    }

    switch (object.alignX) {
      case AlignX.Left:
        return 0;
      case AlignX.Right:
        return object.parent ? this._getWidthAsNumber(object.parent) - this._getWidthAsNumber(object) : 0;
      case AlignX.Center: {
        const parentWidth = object.parent ? this._getWidthAsNumber(object.parent) - this._getWidthAsNumber(object) : 0;
        return parentWidth / 2;
      }
      default:
        Urso.logger.error('AlignX string is not valid!');
        return 0;
    }
  }

  private _adaptAlignY(object: AdaptableObject): number {
    if (typeof object.alignY !== 'string') {
      Urso.logger.error('AlignY value is not string!');
      return 0;
    }

    switch (object.alignY) {
      case AlignY.Top:
        return 0;
      case AlignY.Bottom:
        return object.parent ? this._getHeightAsNumber(object.parent) - this._getHeightAsNumber(object) : 0;
      case AlignY.Center: {
        const parentHeight = object.parent ? this._getHeightAsNumber(object.parent) - this._getHeightAsNumber(object) : 0;
        return parentHeight / 2;
      }
      default:
        Urso.logger.error('AlignY string is not valid!');
        return 0;
    }
  }

  // CRITICAL: false->null migration.
  // Old JS: `typeof object.width !== 'boolean'` meant "width is set (not false)".
  // New TS: `object.width !== null` means "width is set (not null)".
  private _adaptWidth(object: AdaptableObject): void {
    if (object.width !== null && object.scaleX !== 1) {
      Urso.logger.error('Width value cannot be set. ScaleX already used!!', object);
      this._setPropertyWithoutAdaption(object, 'width', null);
      return;
    }

    if (!object.width) {
      return;
    }

    if (!this._isValueANumberOrPercentsString(object.width)) {
      Urso.logger.error('Width value is not valid!!');
      return;
    }

    if (!this._canBeParent(object)) {
      const pixiObject = object._baseObject!;
      pixiObject.width = this._getWidthAsNumber(object);
    }
  }

  // CRITICAL: false->null migration (same as _adaptWidth).
  private _adaptHeight(object: AdaptableObject): void {
    if (object.height !== null && object.scaleY !== 1) {
      Urso.logger.error('Height value cannot be set. ScaleY already used!!', object);
      this._setPropertyWithoutAdaption(object, 'height', null);
      return;
    }

    if (!object.height) {
      return;
    }

    if (!this._isValueANumberOrPercentsString(object.height)) {
      Urso.logger.error('Height value not valid!');
      return;
    }

    if (!this._canBeParent(object)) {
      const pixiObject = object._baseObject!;
      pixiObject.height = this._getHeightAsNumber(object);
    }
  }

  private _getXAsNumber(object: AdaptableObject): number {
    return this._getPropertyAsNumber(object, 'x', 'width');
  }

  private _getYAsNumber(object: AdaptableObject): number {
    return this._getPropertyAsNumber(object, 'y', 'height');
  }

  private _getWidthAsNumber(object: AdaptableObject): number {
    return this._getPropertyAsNumber(object, 'width', 'width');
  }

  private _getHeightAsNumber(object: AdaptableObject): number {
    return this._getPropertyAsNumber(object, 'height', 'height');
  }

  // CRITICAL: false->null migration.
  // Old JS `case 'boolean':` handled `false` (no value set).
  // Now `null` is used, and `typeof null === 'object'`, so we check for null explicitly.
  private _getPropertyAsNumber(object: AdaptableObject, propertyName: string, parentPropertyName: string): number {
    const value = object[propertyName];

    if (value === null) {
      // null means "no explicit value" -- inherit from parent or read from pixi
      if (this._canBeParent(object)) {
        return this._getPropertyAsNumber(object.parent!, propertyName, parentPropertyName);
      } else {
        return (object._baseObject as unknown as Record<string, number>)[propertyName];
      }
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parentValue = this._getPropertyAsNumber(object.parent!, parentPropertyName, parentPropertyName);
      return this._getRoundedPercentageOfNumber(value, parentValue);
    }

    Urso.logger.error('Property value not number or string!', object, propertyName);
    return 0;
  }

  private _getRoundedPercentageOfNumber(percentsString: string, num: number): number {
    const percentsFloat = parseFloat(percentsString);
    return ~~(percentsFloat * num / 100);
  }

  private _canBeParent(object: AdaptableObject): boolean {
    return this._parentTypes.includes(object.type!);
  }

  private _isValueANumberOrPercentsString(value: unknown): boolean {
    return typeof value === 'number' || (typeof value === 'string' && value.endsWith('%'));
  }

  private _adaptStretchingType(object: AdaptableObject): void {
    if (object.width !== '100%' || object.height !== '100%' || !object.stretchingType) {
      return;
    }

    switch (object.stretchingType) {
      case StretchingType.Inscribed:
        this._inscribe(object);
        break;

      case StretchingType.Circumscribed:
        this._circumscribe(object);
        break;

      case 'false':
        break;

      default:
        Urso.logger.error('StretchingType value not valid!');
        break;
    }
  }

  private _setPropertyAndAdaptIt(object: AdaptableObject, propertyName: string, value: unknown): void {
    object[propertyName] = value;
    this.propertyChangeHandler(object, propertyName);
  }

  private _setStretching(object: AdaptableObject, params: { scale: number; objectWidth: number; objectHeight: number }): void {
    const { scale, objectWidth, objectHeight } = params;

    if (object.scaleX === 1) {
      this._setPropertyAndAdaptIt(object, 'width', objectWidth * scale);
    } else {
      this._setPropertyAndAdaptIt(object, 'scaleX', scale);
    }

    if (object.scaleY === 1) {
      this._setPropertyAndAdaptIt(object, 'height', objectHeight * scale);
    } else {
      this._setPropertyAndAdaptIt(object, 'scaleY', scale);
    }
  }

  private _getObjectValuesForStretching(object: AdaptableObject): { objectWidth: number; objectHeight: number; scaleX: number; scaleY: number } {
    const objectWidth = this._getWidthAsNumber(object);
    const objectHeight = this._getHeightAsNumber(object);
    const parentWidth = this._getWidthAsNumber(object.parent!);
    const parentHeight = this._getHeightAsNumber(object.parent!);

    const scaleX = parentWidth / objectWidth;
    const scaleY = parentHeight / objectHeight;

    return { objectWidth, objectHeight, scaleX, scaleY };
  }

  private _inscribe(object: AdaptableObject): void {
    const { objectWidth, objectHeight, scaleX, scaleY } = this._getObjectValuesForStretching(object);
    const scale = Math.min(scaleX, scaleY);
    this._setStretching(object, { scale, objectWidth, objectHeight });
  }

  private _circumscribe(object: AdaptableObject): void {
    const { objectWidth, objectHeight, scaleX, scaleY } = this._getObjectValuesForStretching(object);
    const scale = Math.max(scaleX, scaleY);
    this._setStretching(object, { scale, objectWidth, objectHeight });
  }
}

export default ModulesObjectsPropertyAdapter;
