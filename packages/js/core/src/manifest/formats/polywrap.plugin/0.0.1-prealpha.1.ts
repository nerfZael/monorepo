/* eslint-disable @typescript-eslint/naming-convention */
/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface PluginManifest {
  /**
   * Polywrap plugin manifest format version.
   */
  format: "0.0.1-prealpha.1";
  /**
   * Plugin language.
   */
  language: string;
  /**
   * Path to graphql schema.
   */
  schema: string;
  /**
   * Redirects source URI to local wrapper or plugin.
   */
  import_redirects?: {
    /**
     * Source URI that needs to be redirected.
     */
    uri: string;
    /**
     * Path to GraphQL schema of the module to which URI will be redirected.
     */
    schema: string;
  }[];
  __type: "PluginManifest";
}
