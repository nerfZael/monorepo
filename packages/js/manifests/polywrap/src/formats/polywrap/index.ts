/* eslint-disable */
/**
 * This file was automatically generated by scripts/manifest/index-ts.mustache.
 * DO NOT MODIFY IT BY HAND. Instead, modify scripts/manifest/index-ts.mustache,
 * and run node ./scripts/manifest/generateFormatTypes.js to regenerate this file.
 */

import {
  PolywrapManifest as PolywrapManifest0_1_0
} from "./0.1.0";

export {
  PolywrapManifest0_1_0,
};

export enum PolywrapManifestFormats {
  "0.1.0" = "0.1.0",
}

export type AnyPolywrapManifest =
  | PolywrapManifest0_1_0

export type PolywrapManifest = PolywrapManifest0_1_0;

export const latestPolywrapManifestFormat = PolywrapManifestFormats["0.1.0"]

export { migratePolywrapManifest } from "./migrate";

export { deserializePolywrapManifest } from "./deserialize";

export { validatePolywrapManifest } from "./validate";
