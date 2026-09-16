// Note: cannot import TypeScript files, only types
// Can only import single level javascript files
import type { Channels, MessageData, IEffect, MinMax } from "../Effect";

// Uncomment this block to allow for importing single javascript files; remove if not needed
// async function jsImport<T = any>(url : string): Promise<T> {
//   const modUrl = URL.createObjectURL(new Blob([await (await fetch(url)).text()], {type: "text/javascript"}));
//   const module = import(modUrl);
//   URL.revokeObjectURL(modUrl);
//   return module;
// }
// const myJsModule = await jsImport("/publicFolderFile.js");

export class MyEffectTemplate implements IEffect {
  static description = "This is a template implementation, to use as an example.";
  static channels: Channels = [
    {
      name: "Speed",
      description: "Animation speed",
      default: 0.5,
    },
    { name: "H",
      description: "Hue",
      default: 0.5,
    }
  ];
  // In case of a 1D effect, prefer to use its x-axis
  static minMax: MinMax = { x: [1, 255], y:[1, 1] };

  public renderDelay = 1 / 1; // One frame per second
  public channelValues: number[];
  public id: string; // Used for non-worker post message

  private leds: ArrayBuffer;
  private boundListener: (data: MessageData) => void;

  constructor(x: number, y: number, channelsPerLed: number, id?: string) {
    this.channelValues = MyEffectTemplate.channels.map(channel => channel.default);
    this.id = id ?? (Math.random() + 1).toString(36).substring(2);
    this.leds = new ArrayBuffer(x * y * channelsPerLed);

    this.boundListener = this.onWindowMessage.bind(this);
    window.addEventListener("message", this.boundListener);

    // Draw initial LED pattern here.
    // ...

    // Initial "frame" Hand over the leds buffer
    this.frame(-1, this.leds);
  }

  destroy(): void {
    window.removeEventListener("message", this.boundListener);
  }

  onWindowMessage({ data: [id, timestamp, type, data] }: MessageData): void {
    if (this.id !== id) return;
    switch (type)
    {
      case "frame":
        this.frame(timestamp, data);
        break;
      case "channels":
        console.log("incoming channel data");
        break;
    }
  }

  frame(timestamp: number | string, _data: ArrayBuffer): void {
    // Migration: ignore messages from Effects
    if (!timestamp) return;

    // Send off the updated frame
    window.postMessage([this.id, 0, "frame", this.leds] );
    // Hand over the leds buffer
    // window.postMessage([this.id, 0, this.leds], { transfer: [this.leds] } );
  }
}

// "requestAnimationFrame"