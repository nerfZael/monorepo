import {
  Env
} from "./Env";

export let env: Env | null = null;

export function requireEnv(): Env {
  if (env == null) throw new Error("Undefined env");
  return env as Env;
}
