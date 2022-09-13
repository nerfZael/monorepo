import {
  Read,
  ReadDecoder,
  Write,
  WriteSizer,
  WriteEncoder,
  Box,
  BigInt,
  BigNumber,
  JSON,
  Context
} from "@polywrap/wasm-as";
import * as Types from "..";

export class Args_moduleMethod {
  str: string;
  optStr: string | null;
  en: Types.CustomEnum;
  optEnum: Box<Types.CustomEnum> | null;
  enumArray: Array<Types.CustomEnum>;
  optEnumArray: Array<Box<Types.CustomEnum> | null> | null;
  map: Map<string, i32>;
  mapOfArr: Map<string, Array<i32>>;
  mapOfMap: Map<string, Map<string, i32>>;
  mapOfObj: Map<string, Types.AnotherType>;
  mapOfArrOfObj: Map<string, Array<Types.AnotherType>>;
}

export function deserializemoduleMethodArgs(argsBuf: ArrayBuffer): Args_moduleMethod {
  const context: Context = new Context("Deserializing module-type: moduleMethod");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _str: string = "";
  let _strSet: bool = false;
  let _optStr: string | null = null;
  let _en: Types.CustomEnum = 0;
  let _enSet: bool = false;
  let _optEnum: Box<Types.CustomEnum> | null = null;
  let _enumArray: Array<Types.CustomEnum> = [];
  let _enumArraySet: bool = false;
  let _optEnumArray: Array<Box<Types.CustomEnum> | null> | null = null;
  let _map: Map<string, i32> = new Map<string, i32>();
  let _mapSet: bool = false;
  let _mapOfArr: Map<string, Array<i32>> = new Map<string, Array<i32>>();
  let _mapOfArrSet: bool = false;
  let _mapOfMap: Map<string, Map<string, i32>> = new Map<string, Map<string, i32>>();
  let _mapOfMapSet: bool = false;
  let _mapOfObj: Map<string, Types.AnotherType> = new Map<string, Types.AnotherType>();
  let _mapOfObjSet: bool = false;
  let _mapOfArrOfObj: Map<string, Array<Types.AnotherType>> = new Map<string, Array<Types.AnotherType>>();
  let _mapOfArrOfObjSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "str") {
      reader.context().push(field, "string", "type found, reading property");
      _str = reader.readString();
      _strSet = true;
      reader.context().pop();
    }
    else if (field == "optStr") {
      reader.context().push(field, "string | null", "type found, reading property");
      _optStr = reader.readOptionalString();
      reader.context().pop();
    }
    else if (field == "en") {
      reader.context().push(field, "Types.CustomEnum", "type found, reading property");
      let value: Types.CustomEnum;
      if (reader.isNextString()) {
        value = Types.getCustomEnumValue(reader.readString());
      } else {
        value = reader.readInt32();
        Types.sanitizeCustomEnumValue(value);
      }
      _en = value;
      _enSet = true;
      reader.context().pop();
    }
    else if (field == "optEnum") {
      reader.context().push(field, "Box<Types.CustomEnum> | null", "type found, reading property");
      let value: Box<Types.CustomEnum> | null;
      if (!reader.isNextNil()) {
        if (reader.isNextString()) {
          value = Box.from(
            Types.getCustomEnumValue(reader.readString())
          );
        } else {
          value = Box.from(
            reader.readInt32()
          );
          Types.sanitizeCustomEnumValue(value.unwrap());
        }
      } else {
        value = null;
      }
      _optEnum = value;
      reader.context().pop();
    }
    else if (field == "enumArray") {
      reader.context().push(field, "Array<Types.CustomEnum>", "type found, reading property");
      _enumArray = reader.readArray((reader: Read): Types.CustomEnum => {
        let value: Types.CustomEnum;
        if (reader.isNextString()) {
          value = Types.getCustomEnumValue(reader.readString());
        } else {
          value = reader.readInt32();
          Types.sanitizeCustomEnumValue(value);
        }
        return value;
      });
      _enumArraySet = true;
      reader.context().pop();
    }
    else if (field == "optEnumArray") {
      reader.context().push(field, "Array<Box<Types.CustomEnum> | null> | null", "type found, reading property");
      _optEnumArray = reader.readOptionalArray((reader: Read): Box<Types.CustomEnum> | null => {
        let value: Box<Types.CustomEnum> | null;
        if (!reader.isNextNil()) {
          if (reader.isNextString()) {
            value = Box.from(
              Types.getCustomEnumValue(reader.readString())
            );
          } else {
            value = Box.from(
              reader.readInt32()
            );
            Types.sanitizeCustomEnumValue(value.unwrap());
          }
        } else {
          value = null;
        }
        return value;
      });
      reader.context().pop();
    }
    else if (field == "map") {
      reader.context().push(field, "Map<string, i32>", "type found, reading property");
      _map = reader.readExtGenericMap((reader: Read): string => {
        return reader.readString();
      }, (reader: Read): i32 => {
        return reader.readInt32();
      });
      _mapSet = true;
      reader.context().pop();
    }
    else if (field == "mapOfArr") {
      reader.context().push(field, "Map<string, Array<i32>>", "type found, reading property");
      _mapOfArr = reader.readExtGenericMap((reader: Read): string => {
        return reader.readString();
      }, (reader: Read): Array<i32> => {
        return reader.readArray((reader: Read): i32 => {
          return reader.readInt32();
        });
      });
      _mapOfArrSet = true;
      reader.context().pop();
    }
    else if (field == "mapOfMap") {
      reader.context().push(field, "Map<string, Map<string, i32>>", "type found, reading property");
      _mapOfMap = reader.readExtGenericMap((reader: Read): string => {
        return reader.readString();
      }, (reader: Read): Map<string, i32> => {
        return reader.readExtGenericMap((reader: Read): string => {
          return reader.readString();
        }, (reader: Read): i32 => {
          return reader.readInt32();
        });
      });
      _mapOfMapSet = true;
      reader.context().pop();
    }
    else if (field == "mapOfObj") {
      reader.context().push(field, "Map<string, Types.AnotherType>", "type found, reading property");
      _mapOfObj = reader.readExtGenericMap((reader: Read): string => {
        return reader.readString();
      }, (reader: Read): Types.AnotherType => {
        const object = Types.AnotherType.read(reader);
        return object;
      });
      _mapOfObjSet = true;
      reader.context().pop();
    }
    else if (field == "mapOfArrOfObj") {
      reader.context().push(field, "Map<string, Array<Types.AnotherType>>", "type found, reading property");
      _mapOfArrOfObj = reader.readExtGenericMap((reader: Read): string => {
        return reader.readString();
      }, (reader: Read): Array<Types.AnotherType> => {
        return reader.readArray((reader: Read): Types.AnotherType => {
          const object = Types.AnotherType.read(reader);
          return object;
        });
      });
      _mapOfArrOfObjSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_strSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'str: String'"));
  }
  if (!_enSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'en: CustomEnum'"));
  }
  if (!_enumArraySet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'enumArray: [CustomEnum]'"));
  }
  if (!_mapSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'map: Map<String, Int>'"));
  }
  if (!_mapOfArrSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'mapOfArr: Map<String, [Int]>'"));
  }
  if (!_mapOfMapSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'mapOfMap: Map<String, Map<String, Int>>'"));
  }
  if (!_mapOfObjSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'mapOfObj: Map<String, AnotherType>'"));
  }
  if (!_mapOfArrOfObjSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'mapOfArrOfObj: Map<String, [AnotherType]>'"));
  }

  return {
    str: _str,
    optStr: _optStr,
    en: _en,
    optEnum: _optEnum,
    enumArray: _enumArray,
    optEnumArray: _optEnumArray,
    map: _map,
    mapOfArr: _mapOfArr,
    mapOfMap: _mapOfMap,
    mapOfObj: _mapOfObj,
    mapOfArrOfObj: _mapOfArrOfObj
  };
}

export function serializemoduleMethodResult(result: i32): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) module-type: moduleMethod");
  const sizer = new WriteSizer(sizerContext);
  writemoduleMethodResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) module-type: moduleMethod");
  const encoder = new WriteEncoder(buffer, sizer, encoderContext);
  writemoduleMethodResult(encoder, result);
  return buffer;
}

export function writemoduleMethodResult(writer: Write, result: i32): void {
  writer.context().push("moduleMethod", "i32", "writing property");
  writer.writeInt32(result);
  writer.context().pop();
}

export class Args_objectMethod {
  object: Types.AnotherType;
  optObject: Types.AnotherType | null;
  objectArray: Array<Types.AnotherType>;
  optObjectArray: Array<Types.AnotherType | null> | null;
}

export function deserializeobjectMethodArgs(argsBuf: ArrayBuffer): Args_objectMethod {
  const context: Context = new Context("Deserializing module-type: objectMethod");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _object: Types.AnotherType | null = null;
  let _objectSet: bool = false;
  let _optObject: Types.AnotherType | null = null;
  let _objectArray: Array<Types.AnotherType> = [];
  let _objectArraySet: bool = false;
  let _optObjectArray: Array<Types.AnotherType | null> | null = null;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "object") {
      reader.context().push(field, "Types.AnotherType", "type found, reading property");
      const object = Types.AnotherType.read(reader);
      _object = object;
      _objectSet = true;
      reader.context().pop();
    }
    else if (field == "optObject") {
      reader.context().push(field, "Types.AnotherType | null", "type found, reading property");
      let object: Types.AnotherType | null = null;
      if (!reader.isNextNil()) {
        object = Types.AnotherType.read(reader);
      }
      _optObject = object;
      reader.context().pop();
    }
    else if (field == "objectArray") {
      reader.context().push(field, "Array<Types.AnotherType>", "type found, reading property");
      _objectArray = reader.readArray((reader: Read): Types.AnotherType => {
        const object = Types.AnotherType.read(reader);
        return object;
      });
      _objectArraySet = true;
      reader.context().pop();
    }
    else if (field == "optObjectArray") {
      reader.context().push(field, "Array<Types.AnotherType | null> | null", "type found, reading property");
      _optObjectArray = reader.readOptionalArray((reader: Read): Types.AnotherType | null => {
        let object: Types.AnotherType | null = null;
        if (!reader.isNextNil()) {
          object = Types.AnotherType.read(reader);
        }
        return object;
      });
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_object || !_objectSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'object: AnotherType'"));
  }
  if (!_objectArraySet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'objectArray: [AnotherType]'"));
  }

  return {
    object: _object,
    optObject: _optObject,
    objectArray: _objectArray,
    optObjectArray: _optObjectArray
  };
}

export function serializeobjectMethodResult(result: Types.AnotherType | null): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) module-type: objectMethod");
  const sizer = new WriteSizer(sizerContext);
  writeobjectMethodResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) module-type: objectMethod");
  const encoder = new WriteEncoder(buffer, sizer, encoderContext);
  writeobjectMethodResult(encoder, result);
  return buffer;
}

export function writeobjectMethodResult(writer: Write, result: Types.AnotherType | null): void {
  writer.context().push("objectMethod", "Types.AnotherType | null", "writing property");
  if (result) {
    Types.AnotherType.write(writer, result as Types.AnotherType);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
}

export class Args_optionalEnvMethod {
  object: Types.AnotherType;
  optObject: Types.AnotherType | null;
  objectArray: Array<Types.AnotherType>;
  optObjectArray: Array<Types.AnotherType | null> | null;
}

export function deserializeoptionalEnvMethodArgs(argsBuf: ArrayBuffer): Args_optionalEnvMethod {
  const context: Context = new Context("Deserializing module-type: optionalEnvMethod");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _object: Types.AnotherType | null = null;
  let _objectSet: bool = false;
  let _optObject: Types.AnotherType | null = null;
  let _objectArray: Array<Types.AnotherType> = [];
  let _objectArraySet: bool = false;
  let _optObjectArray: Array<Types.AnotherType | null> | null = null;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "object") {
      reader.context().push(field, "Types.AnotherType", "type found, reading property");
      const object = Types.AnotherType.read(reader);
      _object = object;
      _objectSet = true;
      reader.context().pop();
    }
    else if (field == "optObject") {
      reader.context().push(field, "Types.AnotherType | null", "type found, reading property");
      let object: Types.AnotherType | null = null;
      if (!reader.isNextNil()) {
        object = Types.AnotherType.read(reader);
      }
      _optObject = object;
      reader.context().pop();
    }
    else if (field == "objectArray") {
      reader.context().push(field, "Array<Types.AnotherType>", "type found, reading property");
      _objectArray = reader.readArray((reader: Read): Types.AnotherType => {
        const object = Types.AnotherType.read(reader);
        return object;
      });
      _objectArraySet = true;
      reader.context().pop();
    }
    else if (field == "optObjectArray") {
      reader.context().push(field, "Array<Types.AnotherType | null> | null", "type found, reading property");
      _optObjectArray = reader.readOptionalArray((reader: Read): Types.AnotherType | null => {
        let object: Types.AnotherType | null = null;
        if (!reader.isNextNil()) {
          object = Types.AnotherType.read(reader);
        }
        return object;
      });
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_object || !_objectSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'object: AnotherType'"));
  }
  if (!_objectArraySet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'objectArray: [AnotherType]'"));
  }

  return {
    object: _object,
    optObject: _optObject,
    objectArray: _objectArray,
    optObjectArray: _optObjectArray
  };
}

export function serializeoptionalEnvMethodResult(result: Types.AnotherType | null): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) module-type: optionalEnvMethod");
  const sizer = new WriteSizer(sizerContext);
  writeoptionalEnvMethodResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) module-type: optionalEnvMethod");
  const encoder = new WriteEncoder(buffer, sizer, encoderContext);
  writeoptionalEnvMethodResult(encoder, result);
  return buffer;
}

export function writeoptionalEnvMethodResult(writer: Write, result: Types.AnotherType | null): void {
  writer.context().push("optionalEnvMethod", "Types.AnotherType | null", "writing property");
  if (result) {
    Types.AnotherType.write(writer, result as Types.AnotherType);
  } else {
    writer.writeNil();
  }
  writer.context().pop();
}

export class Args__if {
  _if: Types._else;
}

export function deserializeifArgs(argsBuf: ArrayBuffer): Args__if {
  const context: Context = new Context("Deserializing module-type: if");
  const reader = new ReadDecoder(argsBuf, context);
  let numFields = reader.readMapLength();

  let _if: Types._else | null = null;
  let _ifSet: bool = false;

  while (numFields > 0) {
    numFields--;
    const field = reader.readString();

    reader.context().push(field, "unknown", "searching for property type");
    if (field == "if") {
      reader.context().push(field, "Types._else", "type found, reading property");
      const object = Types._else.read(reader);
      _if = object;
      _ifSet = true;
      reader.context().pop();
    }
    reader.context().pop();
  }

  if (!_if || !_ifSet) {
    throw new Error(reader.context().printWithContext("Missing required argument: 'if: else'"));
  }

  return {
    _if: _if
  };
}

export function serializeifResult(result: Types._else): ArrayBuffer {
  const sizerContext: Context = new Context("Serializing (sizing) module-type: if");
  const sizer = new WriteSizer(sizerContext);
  writeifResult(sizer, result);
  const buffer = new ArrayBuffer(sizer.length);
  const encoderContext: Context = new Context("Serializing (encoding) module-type: if");
  const encoder = new WriteEncoder(buffer, sizer, encoderContext);
  writeifResult(encoder, result);
  return buffer;
}

export function writeifResult(writer: Write, result: Types._else): void {
  writer.context().push("if", "Types._else", "writing property");
  Types._else.write(writer, result);
  writer.context().pop();
}
