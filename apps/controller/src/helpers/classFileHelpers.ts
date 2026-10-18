import * as esbuild from "esbuild-wasm";
import { Effect, type IEffect } from "../../public/Effect";
import { readTextFile } from "@tauri-apps/plugin-fs";

/** Class constructor of (interface) type C */
// export type ClassConstructor<C, A = any> = new (...args: Array<A>) => C;

export type ClassConstructor<C, A = any[], T = any> = {
  // @ts-ignore - We defined it as any[] already
  new (...args: A): C;
  // [key: string]: any;
} & T;

/** Class module with class K export that constructs instance of C */
type ClassMod<C, K extends string = string, A = any> = {
  [P in K]: ClassConstructor<C, A>; // new mod[K](...A) creates an instance of interface C
}

let initPromise: Promise<void> | undefined;

/**
 * Import and transpile Typescript url
 *
 * @param url The url of the Typescript file
 * @returns An async loaded module of type T.
 *          Use 
 */
function ensureEsbuildInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = esbuild.initialize({
      wasmURL: "/esbuild.wasm",
      worker: false,
    }).catch((error) => {
      initPromise = undefined;
      throw error;
    });
  }

  return initPromise;
}

export async function tsImport<T = unknown>(
  url: string,
): Promise<T> {
  await ensureEsbuildInitialized();
  const source = await readTextFile(url);

  const { code } = await esbuild.transform(source, {
    loader: url.endsWith(".tsx") ? "tsx" : "ts",
    format: "esm",
    target: "esnext",
  });

  const blobUrl = URL.createObjectURL(
    new Blob([code], { type: "text/javascript" }),
  );

  try {
    return await import(/* @vite-ignore */ blobUrl) as T;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

export const loadEffect = async(fileName: string): Promise<Effect | undefined> => {
  const className = fileName.match(/(?:^|\/)([A-Z][a-zA-Z0-9_]*)\.[tj]s$/)?.[1];
  if (!className) return;

  try {
    const mod = await tsImport<ClassMod<IEffect>>(fileName);
    const EffectClass = mod[className];

    if (!EffectClass) return;
    // Verify interface in debug mode
    if (import.meta.env.DEV)
    {
      const c = Object.getOwnPropertyNames(EffectClass.prototype);
      const i = Object.getOwnPropertyNames(EffectClass);
      console.assert(["constructor", "frame"].every((k) => c.includes(k)), "Unexpected class: missing functions");

      // TODO: determine renderDelay property after instantiating.

      console.assert(["name", "description", "channels", "minMax"].every((k) => i.includes(k)), "Unexpected class: missing static variables");
    }
    return EffectClass;
  } catch(e) {
    console.warn("loadEffect", e);
    return undefined;
  }
};