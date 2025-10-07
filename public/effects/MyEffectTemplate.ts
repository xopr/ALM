// Note: cannot import TypeScript files, only types
// Can only import single level javascript files
import { Channels, MinMax, type Effect } from "../Effect";

// Uncomment this block to allow for importing single javascript files; remove if not needed
// async function jsimport<T = any>(url : string): Promise<T> {
//   const modUrl = URL.createObjectURL(new Blob([await (await fetch(url)).text()], {type: "text/javascript"}));
//   const module = import(modUrl);
//   URL.revokeObjectURL(modUrl);
//   return module;
// }
// const myJsModule = await jsimport("/publicFolderFile.js");

export class MyEffectTemplate implements Effect {
  get minMax(): MinMax {
    throw new Error("Method not implemented.");
  }
  get channels(): Channels {
    throw new Error("Method not implemented.");
  }
  get refreshRate(): number {
    throw new Error("Method not implemented.");
  }
  frame(timestamp: number): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
}


// export const supportedLigh
// document.timeline.currentTime
// "requestAnimationFrame"