import { AssetTypeId, ObjectTypeId } from '../../types';
import type { TemplateTypesList } from '../../types';

/**
 * Provides the canonical mapping of asset and object type names to their
 * numeric IDs. This indirection allows game code to reference types by name
 * (e.g. `Urso.types.assets.IMAGE`) rather than importing enums directly,
 * matching the original JS runtime API surface.
 */
class ModulesTemplateTypes {
  public readonly list: TemplateTypesList = {
    assets: {
      ATLAS: AssetTypeId.ATLAS,
      AUDIOSPRITE: AssetTypeId.AUDIOSPRITE,
      BITMAPFONT: AssetTypeId.BITMAPFONT,
      CONTAINER: AssetTypeId.CONTAINER,
      FONT: AssetTypeId.FONT,
      IMAGE: AssetTypeId.IMAGE,
      JSON: AssetTypeId.JSON,
      JSONATLAS: AssetTypeId.JSONATLAS,
      SOUND: AssetTypeId.SOUND,
      SPINE: AssetTypeId.SPINE,
      SPINEATLAS: AssetTypeId.SPINEATLAS,
      HTML: AssetTypeId.HTML,
    },
    objects: {
      BITMAPTEXT: ObjectTypeId.BITMAPTEXT,
      BUTTON: ObjectTypeId.BUTTON,
      BUTTONCOMPOSITE: ObjectTypeId.BUTTONCOMPOSITE,
      CHECKBOX: ObjectTypeId.CHECKBOX,
      COLLECTION: ObjectTypeId.COLLECTION,
      COMPONENT: ObjectTypeId.COMPONENT,
      CONTAINER: ObjectTypeId.CONTAINER,
      DRAGCONTAINER: ObjectTypeId.DRAGCONTAINER,
      EMITTER: ObjectTypeId.EMITTER,
      EMITTERFX: ObjectTypeId.EMITTERFX,
      GRAPHICS: ObjectTypeId.GRAPHICS,
      GROUP: ObjectTypeId.GROUP,
      HITAREA: ObjectTypeId.HITAREA,
      IMAGE: ObjectTypeId.IMAGE,
      IMAGESANIMATION: ObjectTypeId.IMAGESANIMATION,
      MASK: ObjectTypeId.MASK,
      NINESLICEPLANE: ObjectTypeId.NINESLICEPLANE,
      SCROLLBOX: ObjectTypeId.SCROLLBOX,
      SLIDER: ObjectTypeId.SLIDER,
      SPINE: ObjectTypeId.SPINE,
      TEXT: ObjectTypeId.TEXT,
      TEXTINPUT: ObjectTypeId.TEXTINPUT,
      TOGGLE: ObjectTypeId.TOGGLE,
      WORLD: ObjectTypeId.WORLD,
    },
  };
}

export default ModulesTemplateTypes;
