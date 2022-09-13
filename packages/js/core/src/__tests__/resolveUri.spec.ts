import {
  UriResolverInterface,
  coreInterfaceUris,
  Client,
  InvokeOptions,
  InvokeResult,
  PluginModule,
  QueryOptions,
  QueryResult,
  Uri,
  UriRedirect,
  UriResolver,
  resolveUri,
  RedirectsResolver,
  ExtendableUriResolver,
  PluginResolver,
  Wrapper,
  Env,
  GetFileOptions,
  GetImplementationsOptions,
  InterfaceImplementations,
  PluginRegistration,
  SubscribeOptions,
  Subscription,
  PluginPackage,
  SimpleCache,
  GetManifestOptions,
} from "..";

import { WrapManifest } from "@polywrap/wrap-manifest-types-js";
import { msgpackEncode } from "@polywrap/msgpack-js";

describe("resolveUri", () => {
  const client = (
    wrappers: Record<string, PluginModule<{}>>,
    plugins: PluginRegistration<Uri>[] = [],
    interfaces: InterfaceImplementations<Uri>[] = [],
    redirects: UriRedirect<Uri>[] = []
  ): Client =>
    (({
      getEnvByUri: () => undefined,
      getRedirects: () => redirects,
      getPlugins: () => plugins,
      getInterfaces: () => interfaces,
      query: <
        TData extends Record<string, unknown> = Record<string, unknown>,
        TVariables extends Record<string, unknown> = Record<string, unknown>
      >(
        _options: QueryOptions<TVariables, string | Uri>
      ): Promise<QueryResult<TData>> => {
        return Promise.resolve({
          data: ({
            foo: "foo",
          } as Record<string, unknown>) as TData,
        });
      },
      invoke: <TData = unknown>(
        options: InvokeOptions<string | Uri>
      ): Promise<InvokeResult<TData>> => {
        let uri = options.uri;
        if (Uri.isUri(uri)) {
          uri = uri.uri;
        }
        return Promise.resolve({
          // @ts-ignore
          data: wrappers[uri]?.[options.method](
            options.args as Record<string, unknown>,
            {} as Client
          ) as TData
        });
      },
      subscribe: <
        TData extends Record<string, unknown> = Record<string, unknown>
      >(
        _options: SubscribeOptions<string | Uri>
      ): Subscription<TData> => {
        return {
          frequency: 0,
          isActive: false,
          stop: () => {},
          async *[Symbol.asyncIterator](): AsyncGenerator<
            QueryResult<TData>
          > {},
        };
      },
      getSchema: (uri: Uri | string): Promise<string> => {
        return Promise.resolve("");
      },
      getFile: () => {
        return Promise.resolve("");
      },
      getImplementations: <TUri extends Uri | string>(
        uri: TUri,
        options: GetImplementationsOptions
      ) => {
        return [uri];
      },
    } as unknown) as Client);

  const createPluginWrapper = (uri: Uri, plugin: PluginPackage<{}>): Wrapper => {
    return {
      invoke: () =>
        Promise.resolve({
          data: {
            uri,
            plugin,
          },
          encoded: false
        }),
      getFile: (options: GetFileOptions, client: Client) => Promise.resolve(""),
      getManifest: (options: GetManifestOptions, client: Client) => Promise.resolve({} as WrapManifest)
    };
  };

  const createWrapper = (
    uri: Uri,
    manifest: WrapManifest,
    uriResolver: string
  ): Wrapper => {
    return {
      invoke: () =>
        Promise.resolve({
          data: {
            uri,
            manifest,
            uriResolver,
          },
          encoded: false
        }),
      getFile: (options: GetFileOptions, client: Client) => Promise.resolve(""),
      getManifest: (client) => Promise.reject("")
    };
  };

  const testManifest: WrapManifest = {
    version: "0.1",
    type: "wasm",
    name: "dog-cat",
    abi: {} as never
  };

  const ensWrapper = {
    tryResolveUri: (
      args: { authority: string; path: string },
      _client: Client
    ): UriResolverInterface.MaybeUriOrManifest => {
      return {
        uri: args.authority === "ens" ? "ipfs/QmHash" : undefined,
      };
    },
  };

  const ipfsWrapper = {
      tryResolveUri: (
        args: { authority: string; path: string },
        _client: Client
      ): UriResolverInterface.MaybeUriOrManifest => {
        return {
          manifest:
            args.authority === "ipfs" ?
            msgpackEncode(testManifest, true) :
            undefined,
        };
      }
  };

  const pluginWrapper = {
    tryResolveUri: (
      args: { authority: string; path: string },
      _client: Client
    ): UriResolverInterface.MaybeUriOrManifest  => {
      return {
        manifest:
          args.authority === "my" ?
          msgpackEncode(testManifest, true) :
          undefined,
      };
    },
  };

  const plugins: PluginRegistration<Uri>[] = [
    {
      uri: new Uri("ens/my-plugin"),
      plugin: {
        factory: () => ({} as PluginModule<{}>),
        manifest: {} as WrapManifest,
      },
    },
  ];

  const interfaces: InterfaceImplementations<Uri>[] = [
    {
      interface: coreInterfaceUris.uriResolver,
      implementations: [
        new Uri("ens/ens"),
        new Uri("ens/ipfs"),
        new Uri("ens/my-plugin"),
      ],
    },
  ];

  const wrappers: Record<string, PluginModule<{}>> = {
    "wrap://ens/ens": ensWrapper as unknown as PluginModule<{}>,
    "wrap://ens/ipfs": ipfsWrapper as unknown as PluginModule<{}>,
    "wrap://ens/my-plugin": pluginWrapper as unknown as PluginModule<{}>,
  };

  const uriResolvers: UriResolver[] = [
    new RedirectsResolver(),
    new PluginResolver((uri: Uri, plugin: PluginPackage<{}>) =>
      createPluginWrapper(uri, plugin)
    ),
    new ExtendableUriResolver(
      (
        uri: Uri,
        manifest: WrapManifest,
        uriResolver: string,
        environment: Env<Uri> | undefined
      ) => {
        return createWrapper(uri, manifest, uriResolver);
      },
      { noValidate: true },
      true
    ),
  ];

  it("sanity", () => {
    const wrapper = new Uri("wrap://ens/ens");
    const file = new Uri("wrap/some-file");
    const path = "wrap/some-path";
    const module = UriResolverInterface.module;
    const uri = new Uri("wrap/some-uri");

    expect(module.tryResolveUri(client(wrappers), wrapper, uri)).toBeDefined();
    expect(module.getFile(client(wrappers), file, path)).toBeDefined();
  });

  it("works in the typical case", async () => {
    const result = await resolveUri(
      new Uri("ens/test.eth"),
      uriResolvers,
      client(wrappers, plugins, interfaces),
      new SimpleCache(),
    );

    expect(result.wrapper).toBeTruthy();
    
    const wrapperIdentity = await result.wrapper!.invoke(
      {} as InvokeOptions<Uri>,
      {} as Client
    );

    expect(wrapperIdentity.data).toMatchObject({
      uri: new Uri("ipfs/QmHash"),
      manifest: testManifest,
      uriResolver: "wrap://ens/ipfs",
    });
  });

  it("uses a plugin that implements uri-resolver", async () => {
    const result = await resolveUri(
      new Uri("my/something-different"),
      uriResolvers,
      client(wrappers, plugins, interfaces),
      new SimpleCache(),
    );

    expect(result.wrapper).toBeTruthy();
    
    const wrapperIdentity = await result.wrapper!.invoke(
      {} as InvokeOptions<Uri>,
      {} as Client
    );

    expect(wrapperIdentity.data).toMatchObject({
      uri: new Uri("my/something-different"),
      manifest: testManifest,
      uriResolver: "wrap://ens/my-plugin",
    });
  });

  it("works when direct query a Polywrap that implements the uri-resolver", async () => {
    const result = await resolveUri(
      new Uri("ens/ens"),
      uriResolvers,
      client(wrappers, plugins, interfaces),
      new SimpleCache(),
    );

    expect(result.wrapper).toBeTruthy();
    
    const wrapperIdentity = await result.wrapper!.invoke(
      {} as InvokeOptions<Uri>,
      {} as Client
    );

    expect(wrapperIdentity.data).toMatchObject({
      uri: new Uri("ipfs/QmHash"),
      manifest: testManifest,
      uriResolver: "wrap://ens/ipfs",
    });
  });

  it("works when direct query a plugin Polywrap that implements the uri-resolver", async () => {
    const result = await resolveUri(
      new Uri("my/something-different"),
      uriResolvers,
      client(wrappers, plugins, interfaces),
      new SimpleCache(),
    );

    expect(result.wrapper).toBeTruthy();
    
    const wrapperIdentity = await result.wrapper!.invoke(
      {} as InvokeOptions<Uri>,
      {} as Client
    );

    expect(wrapperIdentity.data).toMatchObject({
      uri: new Uri("my/something-different"),
      manifest: testManifest,
      uriResolver: "wrap://ens/my-plugin",
    });
  });

  it("returns an error when circular redirect loops are found", async () => {
    const circular: UriRedirect<Uri>[] = [
      {
        from: new Uri("some/wrapper"),
        to: new Uri("ens/wrapper"),
      },
      {
        from: new Uri("ens/wrapper"),
        to: new Uri("some/wrapper"),
      },
    ];

    expect.assertions(1);

    return resolveUri(
      new Uri("some/wrapper"),
      uriResolvers,
      client(wrappers, plugins, interfaces, circular),
      new SimpleCache(),
    ).catch((e: Error) =>
      expect(e.message).toMatch(/Infinite loop while resolving URI/)
    );
  });

  it("throws when redirect missing the from property", async () => {
    const missingFromProperty: UriRedirect<Uri>[] = [
      {
        from: new Uri("some/wrapper"),
        to: new Uri("ens/wrapper"),
      },
      {
        from: null as any,
        to: new Uri("another/wrapper"),
      },
    ];

    expect.assertions(1);

    return resolveUri(
      new Uri("some/wrapper"),
      uriResolvers,
      client(wrappers, plugins, interfaces, missingFromProperty),
      new SimpleCache(),
    ).catch((e: Error) =>
      expect(e.message).toMatch(
        "Redirect missing the from property.\nEncountered while resolving wrap://some/wrapper"
      )
    );
  });

  it("works when a Polywrap registers a Plugin", async () => {
    const pluginRegistrations: PluginRegistration<Uri>[] = [
      ...plugins,
      {
        uri: new Uri("some/wrapper"),
        plugin: {
          factory: () => ({} as PluginModule<{}>),
          manifest: {} as WrapManifest,
        },
      },
    ];

    const result = await resolveUri(
      new Uri("some/wrapper"),
      uriResolvers,
      client(wrappers, pluginRegistrations, interfaces),
      new SimpleCache(),
    );

    expect(result.wrapper).toBeTruthy();
    
    const wrapperIdentity = await result.wrapper!.invoke(
      {} as InvokeOptions<Uri>,
      {} as Client
    );

    expect(wrapperIdentity.error).toBeUndefined();
  });

  it("returns URI when it does not resolve to an Wrapper", async () => {
    const faultyIpfsWrapper = {
      tryResolveUri: (
        args: { authority: string; path: string },
        _client: Client
      ) => {
        return {
          manifest: null,
        };
      },
    };

    const uri = new Uri("some/wrapper");

    const { uri: resolvedUri, wrapper, error } = await resolveUri(
      uri,
      uriResolvers,
      client(
        {
          ...wrappers,
          "wrap://ens/ipfs": faultyIpfsWrapper as unknown as PluginModule<{}>
        }, 
        plugins, 
        interfaces
      ),
      new SimpleCache(),
    );

    expect(resolvedUri).toEqual(uri);
    expect(wrapper).toBeFalsy();
    expect(error).toBeFalsy();
  });
});
