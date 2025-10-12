// Note: cannot import TypeScript files, only types
// Can only import single level javascript files
import { Channels, IEffect, MinMax } from "../Effect";

// Uncomment this block to allow for importing single javascript files; remove if not needed
// async function jsimport<T = any>(url : string): Promise<T> {
//   const modUrl = URL.createObjectURL(new Blob([await (await fetch(url)).text()], {type: "text/javascript"}));
//   const module = import(modUrl);
//   URL.revokeObjectURL(modUrl);
//   return module;
// }
// const myJsModule = await jsimport("/publicFolderFile.js");

export class MyEffectTemplate implements IEffect {
  static description = "This is a template implementation, to use as an example.";
  static channels: Channels = [
    { name: "Speed",
      description: "Animation speed",
      default: 0.5,
    }
  ];
  static minMax: MinMax = { x: [1, 255], y:[1, 255] };
  static refreshRate = 1 / 30;

  constructor() {
    // ...
  }

  frame(timestamp: number): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
}


// export const supportedLigh
// document.timeline.currentTime
// "requestAnimationFrame"