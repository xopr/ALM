// /home/xopr/Projects/ART-net/ledstrip-control-ts

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

const period = 1800;
const period13 = period / 3;
const period23 = 2 * period / 3;

const period16 = period / 6;
const period26 = 2 * period / 6;
const period36 = 3 * period / 6;
const period46 = 4 * period / 6;
const period56 = 5 * period / 6;

export class Rainbow implements IEffect {
  static description = "Turns all LEDs the same color.";
  static channels: Channels = [
    // {
    //   name: "R",
    //   description: "Red value",
    //   default: 0.1,
    // },
  ];
  static minMax: MinMax = { x: [1, 255], y:[1, 255] };
  static refreshRate = 0.1;

  channelValues: number[];
  id: string; // Used for non-worker post message

  private leds: ArrayBuffer;
  private boundListener: (data: MessageData) => void;

  private count: number;
  private width: number;
  private height: number;

  constructor(x: number, y: number, channels: number, id?: string) {
    this.channelValues = Rainbow.channels.map(channel => channel.default);
    // HACK: channel amount
    this.channelValues.length = channels;

    this.id = id ?? (Math.random() + 1).toString(36).substring(2);
    this.leds = new ArrayBuffer(x * y * channels);

    this.boundListener = this.onWindowMessage.bind(this);
    window.addEventListener("message", this.boundListener);

    this.count = 0;
    this.width = x;
    this.height = y;

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


    let p = 0;
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const [r,g,b] = this.rainbow(this.count + 5 * p);
        view[p++] = r;
        view[p++] = g;
        view[p++] = b;
      }
    }

    this.count += 1;
    if (this.count >= period)
      this.count -= period;

    window.postMessage([this.id, 0, "frame", this.leds] );
    // Hand over the leds buffer
    // window.postMessage([this.id, 0, this.leds], { transfer: [this.leds] } );
  }

  getColorValue1(count: number)
  {
    // TODO: period step: const c = Math.min(Math.max(0, count), period);
    while (count < 0)
      count += period;

    while (count >= period)
      count -= period;


    if (count >= period23)
      return 0;

    return 255 * Math.sin(count * Math.PI / period23)
  }

  getColorValue2(count: number)
  {
    while (count < 0)
      count += period;

    while (count >= period)
      count -= period;

    if (count < period16)
      return 255;
    if (count < period26)
    {
      count -= period16;
      return 255 * (period16 - count) / period16;
    }
    if (count < period46)
      return 0;
    if (count < period56)
    {
      count -= period46;
      return 255 * count / period16;
    }
    if (count < period)
      return 255;
    return 0;
  }

  rainbow(count: number)
  {
    const r = this.getColorValue2(count);
    const g = this.getColorValue2(count - period13);
    const b = this.getColorValue2(count - period23);
    return [r, g, b];
  }
  
}

// Parent:
// const myWorker = new Worker("/worker.js");
