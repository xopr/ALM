// Note: cannot import TypeScript files, only types
// Can only import single level javascript files
import { type Type, type IEffect, MinMax, Channels, DataFrame } from "../Effect";

// Uncomment this block to allow for importing single javascript files; remove if not needed
// async function jsimport<T = any>(url : string): Promise<T> {
//   const modUrl = URL.createObjectURL(new Blob([await (await fetch(url)).text()], {type: "text/javascript"}));
//   const module = import(modUrl);
//   URL.revokeObjectURL(modUrl);
//   return module;
// }
// const myJsModule = await jsimport("/publicFolderFile.js");

export class Turquoise implements IEffect {
  static description = "Turns all LEDs turquoise to check RGB/GRB alignment.";
  static channels: Channels = [
    {
      name: "V",
      description: "Color value",
      default: 1.0,
    }
  ];
  static minMax: MinMax = { x: [1, 255], y:[1, 255] };
  static refreshRate = 5;

  channelValues: number[];
  id: string; // Used for non-worker post message

  private leds: ArrayBuffer;

  constructor(x: number, y: number, channels: number, id?: string) {
    this.channelValues = Turquoise.channels.map(channel => channel.default);

    this.id = id ?? (Math.random() + 1).toString(36).substring(2);
    this.leds = new ArrayBuffer(x * y * channels);

    window.addEventListener("message", ({ data: [id, timestamp, data] }: DataFrame) => {
      if (this.id !== id) return;
      this.frame(timestamp, data);
    });

    // Initial "frame" Hand over the leds buffer
    this.frame(-1, this.leds);
  }

  frame(timestamp: number, data: ArrayBuffer): void | Promise<void> {
    // Migration: ignore messages from Effects
    if (!timestamp) return;

    this.leds = data;
    const view = new Uint8Array(this.leds);

    for (let i = 0; i < view.length; i += 3/*channels*/) {
      // view[i + 0] = 0; // R
      view[i + 1] = 255; // G
      view[i + 2] = 204; // B
    }

    // console.log("draw frame", timestamp, Array.from(view), data);
    // #0fc
    // Hand over the leds buffer
    window.postMessage([this.id, 0, this.leds], { transfer: [this.leds] } );
  }
}

// Parent:
// const myWorker = new Worker("/worker.js");