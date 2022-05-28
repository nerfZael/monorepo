/* eslint-disable @typescript-eslint/naming-convention */
/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface BuildManifest {
  format: "0.0.1-prealpha.3";
  docker?: {
    name?: string;
    dockerfile?: string;
    buildImageId?: string;
    buildx?:
      | {
          cache?: string | boolean;
          output?: string | boolean;
          removeBuilder?: boolean;
        }
      | boolean;
    removeImage?: boolean;
  };
  config?: {
    [k: string]: unknown;
  };
  linked_packages?: {
    name: string;
    path: string;
    filter?: string;
  }[];
  __type: "BuildManifest";
}
