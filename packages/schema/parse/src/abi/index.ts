import { Abi } from "@polywrap/wrap-manifest-types-js";

export * from "@polywrap/wrap-manifest-types-js";
export * from "./definitions";
export * from "./env";
export * from "./utils";

export function createAbi(): Abi {
  return {
    version: "0.1",
    objectTypes: [],
    enumTypes: [],
    interfaceTypes: [],
    importedObjectTypes: [],
    importedModuleTypes: [],
    importedEnumTypes: [],
    importedEnvTypes: [],
  };
}
