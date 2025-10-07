// Note: cannot import TypeScript files, only types
// Can only import single level javascript files
import { type Type, type Effect, MinMax, Channels } from "../Effect";

// Uncomment this block to allow for importing single javascript files; remove if not needed
// async function jsimport<T = any>(url : string): Promise<T> {
//   const modUrl = URL.createObjectURL(new Blob([await (await fetch(url)).text()], {type: "text/javascript"}));
//   const module = import(modUrl);
//   URL.revokeObjectURL(modUrl);
//   return module;
// }
// const myJsModule = await jsimport("/publicFolderFile.js");


export class Turquoise implements Effect {
  get minMax(): MinMax {
    return { x: [1, 255], y:[1, 255] };
  }

  get channels(): Channels {
    return [];
  }

  get refreshRate(): number {
    return 5;
  }

  // constructor
  frame(timestamp: number): void | Promise<void> {
    // #0fc
    throw new Error("Method not implemented.");
  }
}
