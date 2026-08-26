// Note: cannot import TypeScript files, only types
// Can only import single level javascript files
import type { IEffect, MinMax, Channels, MessageData } from "../Effect";

// Uncomment this block to allow for importing single javascript files; remove if not needed
// async function jsImport<T = any>(url : string): Promise<T> {
//   const modUrl = URL.createObjectURL(new Blob([await (await fetch(url)).text()], {type: "text/javascript"}));
//   const module = import(modUrl);
//   URL.revokeObjectURL(modUrl);
//   return module;
// }
// const myJsModule = await jsImport("/publicFolderFile.js");

export class RGBWW implements IEffect {
  static description = "Turns all LEDs the same color.";
  static channels: Channels = [
    {
      name: "R",
      description: "Red value",
      default: 0.1,
    },
    {
      name: "G",
      description: "Green value",
      default: 0.1,
    },
    {
      name: "B",
      description: "Blue value",
      default: 0.1,
    },
    {
      name: "C",
      description: "Cold white value",
      default: 0.1,
    },
    {
      name: "W",
      description: "Warm white value",
      default: 0.1,
    },
  ];
  static minMax: MinMax = { x: [1, 255], y:[1, 255] };
  static refreshRate = 5;

  channelValues: number[];
  id: string; // Used for non-worker post message

  private leds: ArrayBuffer;
  private boundListener: (data: MessageData) => void;

  constructor(x: number, y: number, channels: number, id?: string) {
    this.channelValues = RGBWW.channels.map(channel => channel.default);
    // HACK: channel amount
    this.channelValues.length = channels;

    this.id = id ?? (Math.random() + 1).toString(36).substring(2);
    this.leds = new ArrayBuffer(x * y * channels);

    this.boundListener = this.onWindowMessage.bind(this);
    window.addEventListener("message", this.boundListener);

    // Initial channel values
    window.postMessage([this.id, 0, "channels", this.channelValues] );

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
        // Check if we even have data
        if (!data.length)
        {
          // Channel "request", response with values
          window.postMessage([this.id, 0, type, this.channelValues] );
        } else {
          // Iterate sparse array
          data.forEach((v,i) => this.channelValues[i] = v);
          this.frame(timestamp, this.leds);
        }
        break;
    }
  }

  frame(timestamp: number, data: ArrayBuffer): void {
    // Migration: ignore messages from Effects
    if (!timestamp) return;

    this.leds = data;
    const view = new Uint8Array(this.leds);

    // TODO: channels

    for (let i = 0; i < view.length; i += 3/*channels*/) {
        this.channelValues.forEach((v, c) => {
            view[i + c] = Math.round(255 * v); // G
        })
    }

    window.postMessage([this.id, 0, "frame", this.leds] );
    // Hand over the leds buffer
    // window.postMessage([this.id, 0, this.leds], { transfer: [this.leds] } );
  }
}

// Parent:
// const myWorker = new Worker("/worker.js");
