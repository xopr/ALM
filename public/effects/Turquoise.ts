// Note: cannot import TypeScript files, only types
import type { IEffect, MinMax, Channels, MessageData } from "../Effect";

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

  public renderDelay = 5;
  public channelValues: number[];
  public id: string; // Used for non-worker post message

  private leds: ArrayBuffer;
  private boundListener: (data: MessageData) => void;

  constructor(x: number, y: number, channelsPerLed: number, id?: string) {
    this.channelValues = Turquoise.channels.map(channel => channel.default);
    this.id = id ?? (Math.random() + 1).toString(36).substring(2);
    this.leds = new ArrayBuffer(x * y * channelsPerLed);

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

    for (let i = 0; i < view.length; i += 3/*channels*/) {
      // view[i + 0] = 0; // R
      view[i + 1] = Math.round(255 * this.channelValues[0]); // G
      view[i + 2] = Math.round(204 * this.channelValues[0]); // B
    }

    // #0fc
    window.postMessage([this.id, 0, "frame", this.leds] );
  }
}
