import type { IEffect, MinMax, Channels, MessageData } from "../Effect";

// Note: Effect is available via globalThis
export class Jacobladder extends Effect implements IEffect {
  static description = "Mad scientist jacobladder";
  static channels: Channels = [];
  static minMax: MinMax = { x: [1, 255], y:[1, 255] };

  public renderDelay = 0.05;
  public channelValues: number[];
  private boundListener: (data: MessageData) => void;

  constructor(x: number, y: number, channelsPerLed: number, id?: string) {
    super(x, y, channelsPerLed, id);

    this.channelValues = Jacobladder.channels.map(channel => channel.default);

    this.boundListener = this.onWindowMessage.bind(this);
    window.addEventListener("message", this.boundListener);


    // Initial channel values
    window.postMessage([this.id, 0, "channels", this.channelValues] );

    // Draw "spark" at the bottom
    for (let x = 0; x < this.width; ++x)
      this.set(x, 1, [64, 192, 255]);
    
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

    this.rotu();

    window.postMessage([this.id, 0, "frame", this.leds] );
  }

}
