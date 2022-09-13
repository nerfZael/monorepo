import { Uri } from "../..";
import { buildWrapper } from "@polywrap/test-env-js";
import { GetPathToTestWrappers } from "@polywrap/test-cases";
import {
  coreInterfaceUris,
  PluginModule,
  ResolveUriErrorType,
} from "@polywrap/core-js";
import { getClient } from "../utils/getClient";
import { WrapManifest } from "@polywrap/wrap-manifest-types-js";
import { ClientConfigBuilder } from "@polywrap/client-config-builder-js";
import { PolywrapClient } from "../..";

jest.setTimeout(200000);

const wrapperPath = `${GetPathToTestWrappers()}/wasm-as/simple`;
const wrapperUri = new Uri(`wrap://file/${wrapperPath}/build`);

const simpleFsResolverWrapperPath = `${GetPathToTestWrappers()}/wasm-as/simple-fs-resolver`;
const simpleFsResolverWrapperUri = new Uri(
  `wrap://file/${simpleFsResolverWrapperPath}/build`
);

const simpleRedirectResolverWrapperPath = `${GetPathToTestWrappers()}/wasm-as/simple-redirect-resolver`;
const simpleRedirectResolverWrapperUri = new Uri(
  `wrap://file/${simpleRedirectResolverWrapperPath}/build`
);

describe("resolveUri", () => {
  beforeAll(async () => {
    await buildWrapper(wrapperPath);
    await buildWrapper(simpleFsResolverWrapperPath);
    await buildWrapper(simpleRedirectResolverWrapperPath);
  });

  it("sanity", async () => {
    const uri = new Uri("ens/uri.eth");

    const client = await getClient();

    const result = await client.resolveUri(uri);

    expect(result.uri).toEqual(uri);
    expect(result.wrapper).toBeFalsy();
    expect(result.error).toBeFalsy();

    expect(result.uriHistory.getResolutionPath().getUriResolvers()).toEqual([]);

    expect(result.uriHistory.stack).toEqual([
      {
        uriResolver: "RedirectsResolver",
        sourceUri: uri,
        result: {
          uri: uri,
          wrapper: false,
        },
      },
      {
        uriResolver: "CacheResolver",
        sourceUri: uri,
        result: {
          uri: uri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: uri,
        result: {
          uri: uri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: uri,
        result: {
          uri: uri,
          wrapper: false,
        },
      },
    ]);
    expect(result.uriHistory.getUriResolvers()).toEqual([
      "RedirectsResolver",
      "CacheResolver",
      "PluginResolver",
      "ExtendableUriResolver",
    ]);
    expect(result.uriHistory.getUris()).toMatchObject([new Uri("ens/uri.eth")]);
  });

  it("can resolve redirects", async () => {
    const fromUri = new Uri("ens/from.eth");
    const toUri1 = new Uri("ens/to1.eth");
    const toUri2 = new Uri("ens/to2.eth");

    const client = await getClient({
      redirects: [
        {
          from: fromUri.uri,
          to: toUri1.uri,
        },
        {
          from: toUri1.uri,
          to: toUri2.uri,
        },
      ],
    });

    const result = await client.resolveUri(fromUri);

    expect(result.uri).toEqual(toUri2);
    expect(result.wrapper).toBeFalsy();
    expect(result.error).toBeFalsy();

    expect(result.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "RedirectsResolver",
    ]);

    expect(result.uriHistory.stack).toEqual([
      {
        uriResolver: "RedirectsResolver",
        sourceUri: fromUri,
        result: {
          uri: toUri2,
          wrapper: false,
        },
      },
      {
        uriResolver: "RedirectsResolver",
        sourceUri: toUri2,
        result: {
          uri: toUri2,
          wrapper: false,
        },
      },
      {
        uriResolver: "CacheResolver",
        sourceUri: toUri2,
        result: {
          uri: toUri2,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: toUri2,
        result: {
          uri: toUri2,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: toUri2,
        result: {
          uri: toUri2,
          wrapper: false,
        },
      },
    ]);
  });

  it("can resolve plugin", async () => {
    const pluginUri = new Uri("ens/plugin.eth");

    const client = await getClient({
      plugins: [
        {
          uri: pluginUri.uri,
          plugin: {
            factory: () => {
              return ({} as unknown) as PluginModule<{}>;
            },
            manifest: {} as WrapManifest,
          },
        },
      ],
    });

    const result = await client.resolveUri(pluginUri);

    expect(result.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "PluginResolver",
    ]);

    expect(result.uriHistory.stack).toEqual([
      {
        uriResolver: "RedirectsResolver",
        sourceUri: pluginUri,
        result: {
          uri: pluginUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "CacheResolver",
        sourceUri: pluginUri,
        result: {
          uri: pluginUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: pluginUri,
        result: {
          uri: pluginUri,
          wrapper: true,
        },
      },
    ]);

    expect(result.wrapper).toBeTruthy();
    expect(result.uri).toEqual(pluginUri);
    expect(result.error).toBeFalsy();
  });

  it("can resolve an URI resolver extension wrapper", async () => {
    const config = new ClientConfigBuilder()
      .addInterfaceImplementation(
        coreInterfaceUris.uriResolver,
        simpleFsResolverWrapperUri
      )
      .addDefaults()
      .build();

    const client = new PolywrapClient(config, { noDefaults: true });

    const sourceUri = new Uri(`simple/${wrapperPath}/build`);
    const redirectedUri = wrapperUri;

    const result = await client.resolveUri(sourceUri);
    expect(result.uriHistory.stack).toEqual([
      {
        uriResolver: "RedirectsResolver",
        sourceUri: sourceUri,
        result: {
          uri: sourceUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "CacheResolver",
        sourceUri: sourceUri,
        result: {
          uri: sourceUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: sourceUri,
        result: {
          uri: sourceUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: sourceUri,
        result: {
          uri: redirectedUri,
          wrapper: false,
          implementationUri: simpleFsResolverWrapperUri,
        },
      },
      {
        uriResolver: "RedirectsResolver",
        sourceUri: redirectedUri,
        result: {
          uri: redirectedUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "CacheResolver",
        sourceUri: redirectedUri,
        result: {
          uri: redirectedUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: redirectedUri,
        result: {
          uri: redirectedUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: redirectedUri,
        result: {
          uri: redirectedUri,
          wrapper: true,
          implementationUri: new Uri("wrap://ens/fs-resolver.polywrap.eth"),
        },
      },
    ]);

    expect(result.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "ExtendableUriResolver",
      "ExtendableUriResolver",
    ]);

    expect(result.wrapper).toBeTruthy();
    expect(result.uri).toEqual(redirectedUri);
    expect(result.error).toBeFalsy();
  });

  it("can resolve cache", async () => {
    const client = await getClient();

    const result = await client.resolveUri(wrapperUri);

    expect(result.wrapper).toBeTruthy();
    expect(result.uri).toEqual(wrapperUri);
    expect(result.error).toBeFalsy();

    expect(result.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "ExtendableUriResolver",
    ]);

    expect(result.uriHistory.stack).toEqual([
      {
        uriResolver: "RedirectsResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        sourceUri: wrapperUri,
        uriResolver: "CacheResolver",
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: true,
          implementationUri: new Uri("wrap://ens/fs-resolver.polywrap.eth"),
        },
      },
    ]);

    const result2 = await client.resolveUri(wrapperUri);

    expect(result2.wrapper).toBeTruthy();
    expect(result2.uri).toEqual(wrapperUri);
    expect(result2.error).toBeFalsy();

    expect(result2.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "CacheResolver",
    ]);

    expect(result2.uriHistory.stack).toEqual([
      {
        uriResolver: "RedirectsResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        sourceUri: wrapperUri,
        uriResolver: "CacheResolver",
        result: {
          uri: wrapperUri,
          wrapper: true,
        },
      },
    ]);
  });

  it("can resolve cache - noCacheRead", async () => {
    const client = await getClient();

    const result = await client.resolveUri(wrapperUri);

    expect(result.wrapper).toBeTruthy();
    expect(result.uri).toEqual(wrapperUri);
    expect(result.error).toBeFalsy();

    expect(result.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "ExtendableUriResolver",
    ]);

    expect(result.uriHistory.stack).toEqual([
      {
        uriResolver: "RedirectsResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        sourceUri: wrapperUri,
        uriResolver: "CacheResolver",
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: true,
          implementationUri: new Uri("wrap://ens/fs-resolver.polywrap.eth"),
        },
      },
    ]);

    const result2 = await client.resolveUri(wrapperUri, { noCacheRead: true });

    expect(result2.wrapper).toBeTruthy();
    expect(result2.uri).toEqual(wrapperUri);
    expect(result2.error).toBeFalsy();

    expect(result2.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "ExtendableUriResolver",
    ]);

    expect(result2.uriHistory.stack).toEqual([
      {
        uriResolver: "RedirectsResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: true,
          implementationUri: new Uri("wrap://ens/fs-resolver.polywrap.eth"),
        },
      },
    ]);
  });

  it("can resolve cache - noCacheWrite", async () => {
    const client = await getClient();

    const result = await client.resolveUri(wrapperUri, { noCacheWrite: true });

    expect(result.wrapper).toBeTruthy();
    expect(result.uri).toEqual(wrapperUri);
    expect(result.error).toBeFalsy();

    expect(result.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "ExtendableUriResolver",
    ]);

    expect(result.uriHistory.stack).toEqual([
      {
        uriResolver: "RedirectsResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "CacheResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: true,
          implementationUri: new Uri("wrap://ens/fs-resolver.polywrap.eth"),
        },
      },
    ]);

    const result2 = await client.resolveUri(wrapperUri);

    expect(result2.wrapper).toBeTruthy();
    expect(result2.uri).toEqual(wrapperUri);
    expect(result2.error).toBeFalsy();

    expect(result2.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "ExtendableUriResolver",
    ]);

    expect(result2.uriHistory.stack).toEqual([
      {
        uriResolver: "RedirectsResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "CacheResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: wrapperUri,
        result: {
          uri: wrapperUri,
          wrapper: true,
          implementationUri: new Uri("wrap://ens/fs-resolver.polywrap.eth"),
        },
      },
    ]);
  });

  it("can resolve previously cached URI after redirecting by a URI resolver extension", async () => {
    const client = await getClient({
      interfaces: [
        {
          interface: coreInterfaceUris.uriResolver.uri,
          implementations: [
            simpleFsResolverWrapperUri.uri,
            simpleRedirectResolverWrapperUri.uri,
          ],
        },
      ],
    });

    const sourceUri = new Uri(`simple-redirect/${wrapperPath}/build`);
    const redirectedUri = new Uri(`simple/${wrapperPath}/build`);
    const finalUri = wrapperUri;

    const result = await client.resolveUri(redirectedUri);

    expect(result.wrapper).toBeTruthy();
    expect(result.uri).toEqual(finalUri);
    expect(result.error).toBeFalsy();

    expect(result.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "ExtendableUriResolver",
      "ExtendableUriResolver",
    ]);

    expect(result.uriHistory.stack).toEqual([
      {
        uriResolver: "RedirectsResolver",
        sourceUri: redirectedUri,
        result: {
          uri: redirectedUri,
          wrapper: false,
        },
      },
      {
        sourceUri: redirectedUri,
        uriResolver: "CacheResolver",
        result: {
          uri: redirectedUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: redirectedUri,
        result: {
          uri: redirectedUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: redirectedUri,
        result: {
          uri: finalUri,
          wrapper: false,
          implementationUri: simpleFsResolverWrapperUri,
        },
      },
      {
        uriResolver: "RedirectsResolver",
        sourceUri: finalUri,
        result: {
          uri: finalUri,
          wrapper: false,
        },
      },
      {
        sourceUri: finalUri,
        uriResolver: "CacheResolver",
        result: {
          uri: finalUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: finalUri,
        result: {
          uri: finalUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: finalUri,
        result: {
          uri: finalUri,
          wrapper: true,
          implementationUri: new Uri("wrap://ens/fs-resolver.polywrap.eth"),
        },
      },
    ]);

    const result2 = await client.resolveUri(sourceUri);

    expect(result2.wrapper).toBeTruthy();
    expect(result2.uri).toEqual(redirectedUri);
    expect(result2.error).toBeFalsy();

    expect(result2.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "ExtendableUriResolver",
      "CacheResolver",
    ]);

    expect(result2.uriHistory.stack).toEqual([
      {
        uriResolver: "RedirectsResolver",
        sourceUri: sourceUri,
        result: {
          uri: sourceUri,
          wrapper: false,
        },
      },
      {
        sourceUri: sourceUri,
        uriResolver: "CacheResolver",
        result: {
          uri: sourceUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: sourceUri,
        result: {
          uri: sourceUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: sourceUri,
        result: {
          uri: redirectedUri,
          wrapper: false,
          implementationUri: simpleRedirectResolverWrapperUri,
        },
      },
      {
        uriResolver: "RedirectsResolver",
        sourceUri: redirectedUri,
        result: {
          uri: redirectedUri,
          wrapper: false,
        },
      },
      {
        sourceUri: redirectedUri,
        uriResolver: "CacheResolver",
        result: {
          uri: redirectedUri,
          wrapper: true,
        },
      },
    ]);
  });

  it("restarts URI resolution after URI resolver extension redirect", async () => {
    //Testing that the redirects (RedirectResolver) are respected after a URI resolver extension redirect

    const sourceUri = new Uri(`simple-redirect/${wrapperPath}/build`);
    const resolverRedirectUri = new Uri(`simple/${wrapperPath}/build`);
    const finalRedirectedUri = new Uri(`ens/redirect.eth`);

    const client = await getClient({
      redirects: [
        {
          from: resolverRedirectUri.uri,
          to: finalRedirectedUri.uri,
        },
      ],
      interfaces: [
        {
          interface: coreInterfaceUris.uriResolver.uri,
          implementations: [
            simpleFsResolverWrapperUri.uri,
            simpleRedirectResolverWrapperUri.uri,
          ],
        },
      ],
    });

    const result = await client.resolveUri(sourceUri);

    expect(result.wrapper).toBeFalsy();
    expect(result.uri).toEqual(finalRedirectedUri);
    expect(result.error).toBeFalsy();

    expect(result.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "ExtendableUriResolver",
      "RedirectsResolver",
    ]);

    expect(result.uriHistory.stack).toEqual([
      {
        uriResolver: "RedirectsResolver",
        sourceUri: sourceUri,
        result: {
          uri: sourceUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "CacheResolver",
        sourceUri: sourceUri,
        result: {
          uri: sourceUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: sourceUri,
        result: {
          uri: sourceUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: sourceUri,
        result: {
          uri: resolverRedirectUri,
          wrapper: false,
          implementationUri: simpleRedirectResolverWrapperUri,
        },
      },
      {
        uriResolver: "RedirectsResolver",
        sourceUri: resolverRedirectUri,
        result: {
          uri: finalRedirectedUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "RedirectsResolver",
        sourceUri: finalRedirectedUri,
        result: {
          uri: finalRedirectedUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "CacheResolver",
        sourceUri: finalRedirectedUri,
        result: {
          uri: finalRedirectedUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: finalRedirectedUri,
        result: {
          uri: finalRedirectedUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: finalRedirectedUri,
        result: {
          uri: finalRedirectedUri,
          wrapper: false,
        },
      },
    ]);
  });

  it("can resolve uri with custom resolver", async () => {
    const ensUri = new Uri(`ens/test`);
    const redirectUri = new Uri(`ens/redirect.eth`);

    const config = new ClientConfigBuilder()
      .addUriResolver({
        name: "CustomResolver",
        resolveUri: async (uri: Uri) => {
          if (uri.uri === ensUri.uri) {
            return {
              uri: redirectUri,
            };
          }

          return {
            uri: uri,
          };
        },
      })
      .addDefaults()
      .build();

    const client = new PolywrapClient(config, { noDefaults: true });

    const result = await client.resolveUri(ensUri);

    expect(result.wrapper).toBeFalsy();
    expect(result.uri).toEqual(redirectUri);
    expect(result.error).toBeFalsy();

    expect(result.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "CustomResolver",
    ]);

    expect(result.uriHistory.stack).toEqual([
      {
        uriResolver: "CustomResolver",
        sourceUri: ensUri,
        result: {
          uri: redirectUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "CustomResolver",
        sourceUri: redirectUri,
        result: {
          uri: redirectUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "RedirectsResolver",
        sourceUri: redirectUri,
        result: {
          uri: redirectUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "CacheResolver",
        sourceUri: redirectUri,
        result: {
          uri: redirectUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "PluginResolver",
        sourceUri: redirectUri,
        result: {
          uri: redirectUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "ExtendableUriResolver",
        sourceUri: redirectUri,
        result: {
          uri: redirectUri,
          wrapper: false,
        },
      },
    ]);
  });

  it("can resolve uri with custom resolver at invoke-time", async () => {
    const ensUri = new Uri(`ens/test`);
    const redirectUri = new Uri(`ens/redirect.eth`);

    const client = await getClient();

    const result = await client.resolveUri(ensUri, {
      config: {
        uriResolvers: [
          {
            name: "CustomResolver",
            resolveUri: async (uri: Uri) => {
              if (uri.uri === ensUri.uri) {
                return {
                  uri: redirectUri,
                };
              }

              return {
                uri: uri,
              };
            },
          },
        ],
      },
    });

    expect(result.wrapper).toBeFalsy();
    expect(result.uri).toEqual(redirectUri);
    expect(result.error).toBeFalsy();

    expect(result.uriHistory.getResolutionPath().getUriResolvers()).toEqual([
      "CustomResolver",
    ]);

    expect(result.uriHistory.stack).toEqual([
      {
        uriResolver: "CustomResolver",
        sourceUri: ensUri,
        result: {
          uri: redirectUri,
          wrapper: false,
        },
      },
      {
        uriResolver: "CustomResolver",
        sourceUri: redirectUri,
        result: {
          uri: redirectUri,
          wrapper: false,
        },
      },
    ]);
  });

  it("custom wrapper resolver does not cause infinite recursion when resolved at runtime", async () => {
    const client = await getClient({
      interfaces: [
        {
          interface: "ens/uri-resolver.core.polywrap.eth",
          implementations: ["ens/test-resolver.eth"],
        },
      ],
    });

    const { error } = await client.resolveUri("ens/test.eth");

    expect(error).toBeTruthy();
    if (!error) {
      throw Error();
    }

    expect(error.type).toEqual(ResolveUriErrorType.InternalResolver);
    expect(error.error?.message).toEqual(
      "Could not load the following URI Resolver implementations: wrap://ens/test-resolver.eth"
    );
  });

  it("unresolvable custom wrapper resolver is found when preloaded", async () => {
    const client = await getClient({
      interfaces: [
        {
          interface: "ens/uri-resolver.core.polywrap.eth",
          implementations: ["ens/test-resolver.eth"],
        },
      ],
    });

    const { success, failedUriResolvers } = await client.loadUriResolvers();
    expect(success).toBeFalsy();
    expect(failedUriResolvers).toEqual(["wrap://ens/test-resolver.eth"]);

    const { error } = await client.resolveUri("ens/test.eth");
    expect(error).toBeTruthy();

    if (!error) {
      throw Error();
    }

    expect(error.type).toEqual(ResolveUriErrorType.InternalResolver);
    expect(error.error?.message).toEqual(
      "Could not load the following URI Resolver implementations: wrap://ens/test-resolver.eth"
    );
  });

  it("can preload wrapper resolvers", async () => {
    const client = await getClient();

    const { success, failedUriResolvers } = await client.loadUriResolvers();

    expect(success).toBeTruthy();
    expect(failedUriResolvers.length).toEqual(0);

    const { error, uri, wrapper } = await client.resolveUri("ens/test.eth");

    expect(error).toBeFalsy();
    expect(wrapper).toBeFalsy();
    expect(uri?.uri).toEqual("wrap://ens/test.eth");
  });
});
