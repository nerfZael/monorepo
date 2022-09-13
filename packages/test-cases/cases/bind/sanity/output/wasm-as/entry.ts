import {
  wrap_invoke_args,
  wrap_invoke,
  wrap_abort,
  InvokeArgs
} from "@polywrap/wasm-as";

import {
  moduleMethodWrapped,
  objectMethodWrapped,
  optionalEnvMethodWrapped,
  ifWrapped
} from "./Module/wrapped";

export function _wrap_invoke(method_size: u32, args_size: u32, env_size: u32): bool {
  const args: InvokeArgs = wrap_invoke_args(
    method_size,
    args_size
  );

  if (args.method == "moduleMethod") {
    return wrap_invoke(args, env_size, moduleMethodWrapped);
  }
  else if (args.method == "objectMethod") {
    return wrap_invoke(args, env_size, objectMethodWrapped);
  }
  else if (args.method == "optionalEnvMethod") {
    return wrap_invoke(args, env_size, optionalEnvMethodWrapped);
  }
  else if (args.method == "if") {
    return wrap_invoke(args, env_size, ifWrapped);
  }
  else {
    return wrap_invoke(args, env_size, null);
  }
}

export function wrapAbort(
  msg: string | null,
  file: string | null,
  line: u32,
  column: u32
): void {
  wrap_abort(
    msg ? msg : "",
    file ? file : "",
    line,
    column
  );
}
