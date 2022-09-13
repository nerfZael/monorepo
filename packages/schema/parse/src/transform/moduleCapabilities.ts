import { AbiTransforms } from ".";

import {
  CapabilityDefinition,
  InterfaceDefinition,
  WrapAbi,
} from "@polywrap/wrap-manifest-types-js";

export interface ModuleCapability {
  type: string;
  uri: string;
  namespace: string;
}

export function moduleCapabilities(): AbiTransforms {
  const capabilities: ModuleCapability[] = [];

  const enabledInterfaces: Set<string> = new Set();

  return {
    enter: {
      InterfaceDefinition: (def: InterfaceDefinition) => {
        for (const type in def.capabilities) {
          const info = def.capabilities[type as keyof CapabilityDefinition];
          if (info?.enabled) {
            capabilities.push({
              uri: def.uri,
              namespace: def.namespace,
              type,
            });
            enabledInterfaces.add(def.namespace);
          }
        }
        return def;
      },
    },
    leave: {
      Abi: (info: WrapAbi) => {
        if (info.moduleType) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (info.moduleType as any).capabilities = capabilities;
        }

        if (info.importedModuleTypes) {
          for (const importedModuleDef of info.importedModuleTypes) {
            if (enabledInterfaces.has(importedModuleDef.namespace)) {
              importedModuleDef.isInterface = true;
            }
          }
        }

        return info;
      },
    },
  };
}
