import { ClientConfigBuilder } from "../ClientConfigBuilder";
import {
  Client,
  Env,
  InterfaceImplementations,
  PluginModule,
  PluginRegistration,
  Uri,
  UriRedirect,
  UriResolutionResult,
  UriResolutionStack,
  UriResolver,
  WrapperCache,
} from "@polywrap/core-js";
import { toUri } from "../utils/toUri";
import { getDefaultClientConfig } from "../bundles";

class NamedUriResolver extends UriResolver {
  private _name: string;

  constructor(name: string) {
    super();

    this._name = name;
  }
  get name(): string {
    return this._name;
  }
  resolveUri(
    uri: Uri,
    client: Client,
    cache: WrapperCache,
    resolutionPath: UriResolutionStack
  ): Promise<UriResolutionResult> {
    throw new Error("Method not implemented.");
  }
}

describe("Client config builder", () => {
  const testEnvs: Env[] = [
    { uri: "wrap://ens/test.plugin.one", env: { test: "value" } },
    { uri: "wrap://ens/test.plugin.two", env: { test: "value" } },
  ];

  const testInterfaces: InterfaceImplementations[] = [
    {
      interface: "wrap://ens/test-interface-1.polywrap.eth",
      implementations: ["wrap://ens/test1.polywrap.eth"],
    },
    {
      interface: "wrap://ens/test-interface-2.polywrap.eth",
      implementations: ["wrap://ens/test2.polywrap.eth"],
    },
  ];

  const testPlugins: PluginRegistration[] = [
    {
      uri: "wrap://ens/test1.polywrap.eth",
      plugin: {
        factory: () => ({} as PluginModule<{}>),
        manifest: {
          name: "test",
          abi: {},
          type: "plugin",
          version: "0.1"
        },
      },
    },
    {
      uri: "wrap://ens/test2.polywrap.eth",
      plugin: {
        factory: () => ({} as PluginModule<{}>),
        manifest: {
          name: "test",
          abi: {},
          type: "plugin",
          version: "0.1"
        },
      },
    },
  ];

  const testUriRedirects: UriRedirect[] = [
    {
      from: "wrap://ens/test-one.polywrap.eth",
      to: "wrap://ens/test1.polywrap.eth",
    },
    {
      from: "wrap://ens/test-two.polywrap.eth",
      to: "wrap://ens/test2.polywrap.eth",
    },
  ];

  const testUriResolvers: UriResolver[] = [
    new NamedUriResolver("test1"),
    new NamedUriResolver("test2"),
  ];

  it("should build an empty config", () => {
    const clientConfig = new ClientConfigBuilder().build();

    expect(clientConfig).toStrictEqual({
      envs: [],
      interfaces: [],
      plugins: [],
      redirects: [],
      uriResolvers: [],
    });
  });

  it("should succesfully add config object and build", () => {
    const clientConfig = new ClientConfigBuilder()
      .add({
        envs: testEnvs,
        interfaces: testInterfaces,
        plugins: testPlugins,
        redirects: testUriRedirects,
        uriResolvers: testUriResolvers,
      })
      .build();

    expect(clientConfig).toBeTruthy();
    expect(clientConfig.envs).toStrictEqual(
      testEnvs.map((x) => ({
        uri: toUri(x.uri),
        env: x.env,
      }))
    );
    expect(clientConfig.interfaces).toStrictEqual(
      testInterfaces.map((x) => ({
        interface: toUri(x.interface),
        implementations: x.implementations.map(toUri),
      }))
    );
    expect(clientConfig.plugins).toStrictEqual(
      testPlugins.map((x) => ({
        uri: toUri(x.uri),
        plugin: x.plugin,
      }))
    );
    expect(clientConfig.redirects).toStrictEqual(
      testUriRedirects.map((x) => ({
        from: toUri(x.from),
        to: toUri(x.to),
      }))
    );
    expect(clientConfig.uriResolvers).toStrictEqual(testUriResolvers);
  });

  it("should succesfully add and merge two config objects and build", () => {
    const clientConfig = new ClientConfigBuilder()
      .add({
        envs: [testEnvs[0]],
        interfaces: [testInterfaces[0]],
        plugins: [testPlugins[0]],
        redirects: [testUriRedirects[0]],
        uriResolvers: [testUriResolvers[0]],
      })
      .add({
        envs: [testEnvs[1]],
        interfaces: [testInterfaces[1]],
        plugins: [testPlugins[1]],
        redirects: [testUriRedirects[1]],
        uriResolvers: [testUriResolvers[1]],
      })
      .build();

    expect(clientConfig).toBeTruthy();
    expect(clientConfig.envs).toStrictEqual(
      testEnvs.map((x) => ({
        uri: toUri(x.uri),
        env: x.env,
      }))
    );
    expect(clientConfig.interfaces).toStrictEqual(
      testInterfaces.map((x) => ({
        interface: toUri(x.interface),
        implementations: x.implementations.map(toUri),
      }))
    );
    expect(clientConfig.plugins).toStrictEqual(
      testPlugins.map((x) => ({
        uri: toUri(x.uri),
        plugin: x.plugin,
      }))
    );
    expect(clientConfig.redirects).toStrictEqual(
      testUriRedirects.map((x) => ({
        from: toUri(x.from),
        to: toUri(x.to),
      }))
    );
    expect(clientConfig.uriResolvers).toStrictEqual(testUriResolvers);
  });

  it("should successfully add the default config", () => {
    const clientConfig = new ClientConfigBuilder().addDefaults().build();

    const expectedConfig = getDefaultClientConfig();

    expect(clientConfig).toBeTruthy();
    expect(clientConfig.envs).toStrictEqual(expectedConfig.envs);
    expect(clientConfig.interfaces).toStrictEqual(expectedConfig.interfaces);
    expect(clientConfig.plugins).toHaveLength(expectedConfig.plugins.length);
    for (let i = 0; i < clientConfig.plugins.length; i++) {
      expect(clientConfig.plugins[i].uri).toEqual(
        expectedConfig.plugins[i].uri
      );
      expect(clientConfig.plugins[i].plugin.manifest).toEqual(
        expectedConfig.plugins[i].plugin.manifest
      );
    }
    expect(clientConfig.redirects).toStrictEqual(expectedConfig.redirects);
    expect(clientConfig.uriResolvers).toHaveLength(expectedConfig.uriResolvers.length);
    for (let i = 0; i < clientConfig.uriResolvers.length; i++) {
      expect(clientConfig.uriResolvers[i].name).toEqual(
        expectedConfig.uriResolvers[i].name
      );
    }
  });

  it("should successfully add a plugin", () => {
    const pluginUri = "wrap://ens/some-plugin.polywrap.eth";
    const pluginPackage = testPlugins[0].plugin;

    const config = new ClientConfigBuilder()
      .addPlugin(pluginUri, pluginPackage)
      .build();

    expect(config.plugins).toHaveLength(1);
    expect(config.plugins[0].uri).toStrictEqual(toUri(pluginUri));
    expect(config.plugins[0].plugin).toStrictEqual(pluginPackage);
  });

  it("should successfully add multiple plugins", () => {
    const config = new ClientConfigBuilder()
      .addPlugin(testPlugins[0].uri, testPlugins[0].plugin)
      .addPlugin(testPlugins[1].uri, testPlugins[1].plugin)
      .build();

    expect(config.plugins).toHaveLength(2);
    expect(config.plugins).toContainEqual({
      uri: toUri(testPlugins[0].uri),
      plugin: testPlugins[0].plugin,
    });
    expect(config.plugins).toContainEqual({
      uri: toUri(testPlugins[1].uri),
      plugin: testPlugins[1].plugin,
    });
  });

  it("should succesfully overwrite a plugin", () => {
    const pluginUri = "wrap://ens/some-plugin.polywrap.eth";
    const pluginPackage1 = testPlugins[0].plugin;
    const pluginPackage2 = testPlugins[1].plugin;

    const config = new ClientConfigBuilder()
      .addPlugin(pluginUri, pluginPackage1)
      .addPlugin(pluginUri, pluginPackage2)
      .build();

    expect(config.plugins).toHaveLength(1);
    expect(config.plugins[0].uri).toStrictEqual(toUri(pluginUri));
    expect(config.plugins[0].plugin).not.toStrictEqual(pluginPackage1);
    expect(config.plugins[0].plugin).toStrictEqual(pluginPackage2);
  });

  it("should remove a plugin", () => {
    const config = new ClientConfigBuilder()
      .addPlugin(testPlugins[0].uri, testPlugins[0].plugin)
      .addPlugin(testPlugins[1].uri, testPlugins[1].plugin)
      .removePlugin(testPlugins[0].uri)
      .build();

    expect(config.plugins).toHaveLength(1);

    const remainingPlugin = config.plugins[0];

    expect(remainingPlugin.uri).toStrictEqual(toUri(testPlugins[1].uri));
    expect(remainingPlugin.plugin).toStrictEqual(testPlugins[1].plugin);
  });

  it("should successfully add an env", () => {
    const envUri = "wrap://ens/some-plugin.polywrap.eth";
    const env = {
      foo: "bar",
      baz: {
        biz: "buz",
      },
    };

    const config = new ClientConfigBuilder().addEnv(envUri, env).build();

    expect(config.envs).toHaveLength(1);
    expect(config.envs[0].uri).toStrictEqual(toUri(envUri));
    expect(config.envs[0].env).toStrictEqual(env);
  });

  it("should successfully add to an existing env", () => {
    const envUri = "wrap://ens/some-plugin.polywrap.eth";
    const env1 = {
      foo: "bar",
    };
    const env2 = {
      baz: {
        biz: "buz",
      },
    };

    const config = new ClientConfigBuilder()
      .addEnv(envUri, env1)
      .addEnv(envUri, env2)
      .build();

    const expectedEnv = { ...env1, ...env2 };

    expect(config.envs).toHaveLength(1);
    expect(config.envs[0].uri).toStrictEqual(toUri(envUri));
    expect(config.envs[0].env).toStrictEqual(expectedEnv);
  });

  it("should succesfully add two separate envs", () => {
    const config = new ClientConfigBuilder()
      .addEnv(testEnvs[0].uri, testEnvs[0].env)
      .addEnv(testEnvs[1].uri, testEnvs[1].env)
      .build();

    expect(config.envs).toHaveLength(2);
    expect(config.envs).toContainEqual({
      uri: toUri(testEnvs[0].uri),
      env: testEnvs[0].env,
    });
    expect(config.envs).toContainEqual({
      uri: toUri(testEnvs[1].uri),
      env: testEnvs[1].env,
    });
  });

  it("should remove an env", () => {
    const config = new ClientConfigBuilder()
      .addEnv(testEnvs[0].uri, testEnvs[0].env)
      .addEnv(testEnvs[1].uri, testEnvs[1].env)
      .removeEnv(testEnvs[0].uri)
      .build();

    expect(config.envs).toHaveLength(1);
    expect(config.envs).toContainEqual({
      uri: toUri(testEnvs[1].uri),
      env: testEnvs[1].env,
    });
  });

  it("should set an env", () => {
    const envUri = "wrap://ens/some.plugin.eth";

    const env = {
      foo: "bar",
    };

    const config = new ClientConfigBuilder().setEnv(envUri, env).build();

    expect(config.envs).toHaveLength(1);
    expect(config.envs[0]).toEqual({
      uri: toUri(envUri),
      env: env,
    });
  });

  it("should set an env over an existing env", () => {
    const envUri = "wrap://ens/some.plugin.eth";

    const env1 = {
      foo: "bar",
    };
    const env2 = {
      bar: "baz",
    };

    const config = new ClientConfigBuilder()
      .addEnv(envUri, env1)
      .setEnv(envUri, env2)
      .build();

    expect(config.envs).toHaveLength(1);
    expect(config.envs[0]).toEqual({
      uri: toUri(envUri),
      env: env2,
    });
  });

  it("should add an interface implementation for a non-existent interface", () => {
    const interfaceUri = "wrap://ens/some.interface.eth";
    const implUri = "wrap://ens/interface.impl.eth";

    const config = new ClientConfigBuilder()
      .addInterfaceImplementation(interfaceUri, implUri)
      .build();

    expect(config.interfaces).toHaveLength(1);

    expect(config.interfaces[0]).toStrictEqual({
      interface: toUri(interfaceUri),
      implementations: [toUri(implUri)],
    });
  });

  it("should add an interface implementation for an interface that already exists", () => {
    const interfaceUri = "wrap://ens/some.interface.eth";
    const implUri1 = "wrap://ens/interface.impl1.eth";
    const implUri2 = "wrap://ens/interface.impl2.eth";

    const config = new ClientConfigBuilder()
      .addInterfaceImplementation(interfaceUri, implUri1)
      .addInterfaceImplementation(interfaceUri, implUri2)
      .build();

    expect(config.interfaces).toHaveLength(1);

    expect(config.interfaces[0].interface).toStrictEqual(toUri(interfaceUri));
    expect(config.interfaces[0].implementations).toContainEqual(
      toUri(implUri1)
    );
    expect(config.interfaces[0].implementations).toContainEqual(
      toUri(implUri2)
    );
  });

  it("should add different implementations for different interfaces", () => {
    const interfaceUri1 = "wrap://ens/some.interface1.eth";
    const interfaceUri2 = "wrap://ens/some.interface2.eth";
    const implUri1 = "wrap://ens/interface.impl1.eth";
    const implUri2 = "wrap://ens/interface.impl2.eth";
    const implUri3 = "wrap://ens/interface.impl3.eth";
    const implUri4 = "wrap://ens/interface.impl4.eth";

    const config = new ClientConfigBuilder()
      .addInterfaceImplementation(interfaceUri1, implUri1)
      .addInterfaceImplementation(interfaceUri2, implUri2)
      .addInterfaceImplementation(interfaceUri1, implUri3)
      .addInterfaceImplementation(interfaceUri2, implUri4)
      .build();

    expect(config.interfaces).toHaveLength(2);

    const interface1 = config.interfaces.find(
      (x) => x.interface.uri === interfaceUri1
    );
    const interface2 = config.interfaces.find(
      (x) => x.interface.uri === interfaceUri2
    );

    expect(interface1).toBeDefined();
    expect(interface1?.implementations).toHaveLength(2);
    expect(interface1?.implementations).toContainEqual(toUri(implUri1));
    expect(interface1?.implementations).toContainEqual(toUri(implUri3));

    expect(interface2).toBeDefined();
    expect(interface2?.implementations).toHaveLength(2);
    expect(interface2?.implementations).toContainEqual(toUri(implUri2));
    expect(interface2?.implementations).toContainEqual(toUri(implUri4));
  });

  it("should add multiple implementations for a non-existent interface", () => {
    const interfaceUri = "wrap://ens/some.interface.eth";
    const implUri1 = "wrap://ens/interface.impl1.eth";
    const implUri2 = "wrap://ens/interface.impl2.eth";

    const config = new ClientConfigBuilder()
      .addInterfaceImplementations(interfaceUri, [implUri1, implUri2])
      .build();

    expect(config.interfaces).toHaveLength(1);

    expect(config.interfaces[0].interface).toStrictEqual(toUri(interfaceUri));
    expect(config.interfaces[0].implementations).toHaveLength(2);
    expect(config.interfaces[0].implementations).toContainEqual(
      toUri(implUri1)
    );
    expect(config.interfaces[0].implementations).toContainEqual(
      toUri(implUri2)
    );
  });

  it("should add multiple implementations for an existing interface", () => {
    const interfaceUri = "wrap://ens/some.interface.eth";
    const implUri1 = "wrap://ens/interface.impl1.eth";
    const implUri2 = "wrap://ens/interface.impl2.eth";
    const implUri3 = "wrap://ens/interface.impl3.eth";

    const config = new ClientConfigBuilder()
      .addInterfaceImplementations(interfaceUri, [implUri1])
      .addInterfaceImplementations(interfaceUri, [implUri2, implUri3])
      .build();

    expect(config.interfaces).toHaveLength(1);

    expect(config.interfaces[0].interface).toStrictEqual(toUri(interfaceUri));
    expect(config.interfaces[0].implementations).toHaveLength(3);
    expect(config.interfaces[0].implementations).toContainEqual(
      toUri(implUri1)
    );
    expect(config.interfaces[0].implementations).toContainEqual(
      toUri(implUri2)
    );
    expect(config.interfaces[0].implementations).toContainEqual(
      toUri(implUri3)
    );
  });

  it("should add multiple different implementations for different interfaces", () => {
    const interfaceUri1 = "wrap://ens/some.interface1.eth";
    const interfaceUri2 = "wrap://ens/some.interface2.eth";
    const implUri1 = "wrap://ens/interface.impl1.eth";
    const implUri2 = "wrap://ens/interface.impl2.eth";
    const implUri3 = "wrap://ens/interface.impl3.eth";
    const implUri4 = "wrap://ens/interface.impl4.eth";
    const implUri5 = "wrap://ens/interface.impl5.eth";
    const implUri6 = "wrap://ens/interface.impl6.eth";

    const config = new ClientConfigBuilder()
      .addInterfaceImplementation(interfaceUri1, implUri1)
      .addInterfaceImplementation(interfaceUri2, implUri2)
      .addInterfaceImplementations(interfaceUri1, [implUri3, implUri5])
      .addInterfaceImplementations(interfaceUri2, [implUri4, implUri6])
      .build();

    expect(config.interfaces).toHaveLength(2);

    const interface1 = config.interfaces.find(
      (x) => x.interface.uri === interfaceUri1
    );
    const interface2 = config.interfaces.find(
      (x) => x.interface.uri === interfaceUri2
    );

    expect(interface1).toBeDefined();
    expect(interface1?.implementations).toHaveLength(3);
    expect(interface1?.implementations).toContainEqual(toUri(implUri1));
    expect(interface1?.implementations).toContainEqual(toUri(implUri3));
    expect(interface1?.implementations).toContainEqual(toUri(implUri5));

    expect(interface2).toBeDefined();
    expect(interface2?.implementations).toHaveLength(3);
    expect(interface2?.implementations).toContainEqual(toUri(implUri2));
    expect(interface2?.implementations).toContainEqual(toUri(implUri4));
    expect(interface2?.implementations).toContainEqual(toUri(implUri6));
  });

  it("should remove an interface implementation", () => {
    const interfaceUri1 = "wrap://ens/some.interface1.eth";
    const interfaceUri2 = "wrap://ens/some.interface2.eth";
    const implUri1 = "wrap://ens/interface.impl1.eth";
    const implUri2 = "wrap://ens/interface.impl2.eth";

    const config = new ClientConfigBuilder()
      .addInterfaceImplementations(interfaceUri1, [implUri1, implUri2])
      .addInterfaceImplementations(interfaceUri2, [implUri1, implUri2])
      .removeInterfaceImplementation(interfaceUri1, implUri2)
      .build();

    expect(config.interfaces).toHaveLength(2);

    const interface1 = config.interfaces.find(
      (x) => x.interface.uri === interfaceUri1
    );
    const interface2 = config.interfaces.find(
      (x) => x.interface.uri === interfaceUri2
    );

    expect(interface1).toBeDefined();
    expect(interface1?.implementations).toHaveLength(1);
    expect(interface1?.implementations).toContainEqual(toUri(implUri1));

    expect(interface2).toBeDefined();
    expect(interface2?.implementations).toHaveLength(2);
    expect(interface2?.implementations).toContainEqual(toUri(implUri1));
    expect(interface2?.implementations).toContainEqual(toUri(implUri2));
  });

  it("should completely remove an interface if there are no implementations left", () => {
    const interfaceUri1 = "wrap://ens/some.interface1.eth";
    const interfaceUri2 = "wrap://ens/some.interface2.eth";
    const implUri1 = "wrap://ens/interface.impl1.eth";
    const implUri2 = "wrap://ens/interface.impl2.eth";

    const config = new ClientConfigBuilder()
      .addInterfaceImplementations(interfaceUri1, [implUri1, implUri2])
      .addInterfaceImplementations(interfaceUri2, [implUri1, implUri2])
      .removeInterfaceImplementation(interfaceUri1, implUri1)
      .removeInterfaceImplementation(interfaceUri1, implUri2)
      .build();

    expect(config.interfaces).toHaveLength(1);

    const interface1 = config.interfaces.find(
      (x) => x.interface.uri === interfaceUri1
    );
    const interface2 = config.interfaces.find(
      (x) => x.interface.uri === interfaceUri2
    );

    expect(interface1).toBeUndefined();

    expect(interface2).toBeDefined();
    expect(interface2?.implementations).toHaveLength(2);
    expect(interface2?.implementations).toContainEqual(toUri(implUri1));
    expect(interface2?.implementations).toContainEqual(toUri(implUri2));
  });

  it("should add an uri redirect", () => {
    const from = "wrap://ens/from.this.ens";
    const to = "wrap://ens/to.that.ens";

    const config = new ClientConfigBuilder().addUriRedirect(from, to).build();

    expect(config.redirects).toHaveLength(1);
    expect(config.redirects).toContainEqual({
      from: toUri(from),
      to: toUri(to),
    });
  });

  it("should add two uri redirects with different from uris", () => {
    const from1 = "wrap://ens/from.this1.ens";
    const to1 = "wrap://ens/to.that1.ens";

    const from2 = "wrap://ens/from.this2.ens";
    const to2 = "wrap://ens/to.that2.ens";

    const config = new ClientConfigBuilder()
      .addUriRedirect(from1, to1)
      .addUriRedirect(from2, to2)
      .build();

    expect(config.redirects).toHaveLength(2);
    expect(config.redirects).toContainEqual({
      from: toUri(from1),
      to: toUri(to1),
    });
    expect(config.redirects).toContainEqual({
      from: toUri(from2),
      to: toUri(to2),
    });
  });

  it("should overwrite an existing uri redirect if from matches on add", () => {
    const from1 = "wrap://ens/from1.this.ens";
    const from2 = "wrap://ens/from2.this.ens";
    const to1 = "wrap://ens/to.that1.ens";
    const to2 = "wrap://ens/to.that2.ens";

    const config = new ClientConfigBuilder()
      .addUriRedirect(from1, to1)
      .addUriRedirect(from2, to1)
      .addUriRedirect(from1, to2)
      .build();

    expect(config.redirects).toHaveLength(2);
    expect(config.redirects).toContainEqual({
      from: toUri(from1),
      to: toUri(to2),
    });
    expect(config.redirects).toContainEqual({
      from: toUri(from2),
      to: toUri(to1),
    });
  });

  it("should remove an uri redirect", () => {
    const from1 = "wrap://ens/from.this1.ens";
    const to1 = "wrap://ens/to.that1.ens";

    const from2 = "wrap://ens/from.this2.ens";
    const to2 = "wrap://ens/to.that2.ens";

    const config = new ClientConfigBuilder()
      .addUriRedirect(from1, to1)
      .addUriRedirect(from2, to2)
      .removeUriRedirect(from1)
      .build();

    expect(config.redirects).toHaveLength(1);
    expect(config.redirects).toContainEqual({
      from: toUri(from2),
      to: toUri(to2),
    });
  });

  it("should add uri resolvers", () => {
    const uriResolver1 = new NamedUriResolver("first");
    const uriResolver2 = new NamedUriResolver("second");

    const config = new ClientConfigBuilder()
      .addUriResolver(uriResolver1)
      .addUriResolver(uriResolver2)
      .build();

    expect(config.uriResolvers).toHaveLength(2);
    expect(config.uriResolvers[0].name).toBe("first");
    expect(config.uriResolvers[1].name).toBe("second");
  });

  it("should set uri resolvers", () => {
    const uriResolver1 = new NamedUriResolver("first");
    const uriResolver2 = new NamedUriResolver("second");

    const config = new ClientConfigBuilder()
      .setUriResolvers([uriResolver1, uriResolver2])
      .build();

    expect(config.uriResolvers).toHaveLength(2);
    expect(config.uriResolvers[0].name).toBe("first");
    expect(config.uriResolvers[1].name).toBe("second");
  });

  it("should overwrite uri resolvers on set when they already exist", () => {
    const uriResolver1 = new NamedUriResolver("first");
    const uriResolver2 = new NamedUriResolver("second");

    const config = new ClientConfigBuilder()
      .setUriResolvers([uriResolver1, uriResolver2])
      .setUriResolvers([uriResolver2, uriResolver1])
      .build();

    expect(config.uriResolvers).toHaveLength(2);
    expect(config.uriResolvers[0].name).toBe("second");
    expect(config.uriResolvers[1].name).toBe("first");
  });
});
