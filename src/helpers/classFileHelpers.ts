import ts from "typescript";
import { type Effect } from "../../public/Effect";

/** Class constructor of (interface) type C */
export type ClassConstructor<C, A = any> = new (...args: Array<A>) => C;

/** Class module with class K export that constructs instance of C */
type ClassMod<C, K extends string = string, A = any> = {
  [P in K]: ClassConstructor<C, A>; // new mod[K](...A) creates an instance of interface C
}

/**
 * Import and transpile Typescript url
 *
 * @param url The url of the Typescript file
 * @returns An async loaded module of type T.
 *          Use 
 */
export const tsImport = async <T = any>(url: string): Promise<T> => {
  try
  {
    const data = await (await fetch(url)).text();
    let result = ts.transpileModule(data, { compilerOptions: { module: ts.ModuleKind.ES2015 }});
    // console.log(result.diagnostics);
    const blob = new Blob([result.outputText], {type: "text/javascript"});
    const modUrl = URL.createObjectURL(blob);
    const module = import(modUrl);
    URL.revokeObjectURL(modUrl);
    return module;
  } catch (e) {
    console.warn("tsImport", e);
    throw new TypeError("TypeScript import failed");
  }
};

export const loadEffect = async(url: string): Promise<ClassConstructor<Effect> | undefined> => {
  const className = url.match(/(?:^|\/)([A-Z][a-zA-Z0-9_]*)\.[tj]s$/)?.[1];

  if (!className) return;

  try {
    const mod = await tsImport<ClassMod<Effect>>(url);
    // const eff = new mod.Matrix()
    const EffectClass = mod[className];

    if (!EffectClass) return;
    // TODO: verify interface in debug (import.meta.env.DEV)
    console.log("instance", Object.getOwnPropertyNames(EffectClass.prototype));
    console.log("static", Object.getOwnPropertyNames(EffectClass));
    return EffectClass;
  } catch(e) {
    console.warn("loadEffect", e);
    // throw new TypeError("TypeScript import failed");
    return undefined;
  }
};