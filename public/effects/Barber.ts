import type { IEffect, MinMax, Channels, MessageData } from "../Effect";

const red = [255,   0,   0];
const white = [64, 64, 64];
const blue = [  0,   0, 255];

const hej = [13, 0, 48]; // DonkerPaars
const hejjer = [62, 0, 255]; // Paars
const krej = [0, 0, 0]; // Zwert
const lucht = [50, 50, 50]; // Wit

const roeed =  [200, 0, 0]; // Roeed
const gael = [196, 128, 0]; // Gael
const greun = [0, 200, 0]; // Greun

const palette = [
    [red, white, white, blue, white, white],
    [krej, roeed, krej, gael, krej, greun],
    [krej, hej, hej, lucht, hej, hej],
];

export class Barber implements IEffect {
  static description = "Barber pole animation";
  static channels: Channels = [
    // TODO: bandwidth, speed
    {
      name: "P",
      description: "Palette",
      default: 0,
    },
  ];
  static minMax: MinMax = { x: [1, 255], y:[1, 255] };

  public renderDelay = 0.2;
  public channelValues: number[];
  public id: string; // Used for non-worker post message

  private leds: ArrayBuffer;
  private boundListener: (data: MessageData) => void;

  private width: number;
  private height: number;

  private offset = 0;

  constructor(x: number, y: number, channelsPerLed: number, id?: string) {
    this.channelValues = Barber.channels.map(channel => channel.default);
    this.id = id ?? (Math.random() + 1).toString(36).substring(2);
    this.leds = new ArrayBuffer(x * y * channelsPerLed);

    this.boundListener = this.onWindowMessage.bind(this);
    window.addEventListener("message", this.boundListener);

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
        }
        break;
    }
  }

  frame(timestamp: number, data: ArrayBuffer): void {
    // Migration: ignore messages from Effects
    if (!timestamp) return;

    this.leds = data;
    const view = new Uint8Array(this.leds);


    const currentPalette = palette[this.channelValues[0] * palette.length | 0];
    let p = 0;
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {

        const [r, g, b] = currentPalette[(x + y + this.offset) % currentPalette.length];

        view[p++] = r;
        view[p++] = g;
        view[p++] = b;
      }
    }

    this.offset--;

    if (this.offset >= currentPalette.length)
      this.offset = 0;
    else if (this.offset < 0)
      this.offset = currentPalette.length - 1;

    window.postMessage([this.id, 0, "frame", this.leds] );
  }

}
