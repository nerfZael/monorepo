import {
  Read,
  Write,
  BigInt,
  BigNumber,
  JSON,
} from "@polywrap/wasm-as";
import {
  serializeTestImport_Env,
  deserializeTestImport_Env,
  writeTestImport_Env,
  readTestImport_Env
} from "./serialization";
import * as Types from "../..";

@serializable
export class TestImport_Env {

  public static uri: string = "testimport.uri.eth";

  enviroProp: string;

  static toBuffer(type: TestImport_Env): ArrayBuffer {
    return serializeTestImport_Env(type);
  }

  static fromBuffer(buffer: ArrayBuffer): TestImport_Env {
    return deserializeTestImport_Env(buffer);
  }

  static write(writer: Write, type: TestImport_Env): void {
    writeTestImport_Env(writer, type);
  }

  static read(reader: Read): TestImport_Env {
    return readTestImport_Env(reader);
  }
}
