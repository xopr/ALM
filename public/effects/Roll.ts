import type { IEffect, MinMax, Channels, MessageData } from "../Effect";

const hej = [13, 0, 48]; // DonkerPaars
const hejjer = [62, 0, 255]; // Paars
const krej = [0, 0, 0]; // Zwert
const lucht = [50, 50, 50]; // Wit

const roeed =  [200, 0, 0]; // Roeed
const gael = [196, 128, 0]; // Gael
const greun = [0, 200, 0]; // Greun

const palette = [
    [roeed, gael, greun],
    [lucht, krej, hej],
];

// Note: Effect is available via globalThis
export class Roll extends Effect implements IEffect {
  static description = "Roll around";
  static channels: Channels = [
    {
      name: "P",
      description: "Palette",
      default: 0,
    },
    {
      name: "B",
      description: "Bandwidth",
      default: 0.5, // 2
    },
    {
      name: "S",
      description: "Speed",
      default: 0.5, // 16384
    },    
  ];
  static minMax: MinMax = { x: [1, 255], y:[1, 255] };

  public renderDelay = 0.05;
  public channelValues: number[];

  private boundListener: (data: MessageData) => void;

  private step = 0;

  constructor(x: number, y: number, channelsPerLed: number, id?: string) {
    super(x, y, channelsPerLed, id);

    this.channelValues = Roll.channels.map(channel => channel.default);

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
        }
        break;
    }
  }

  frame(timestamp: number, data: ArrayBuffer): void {
    // Migration: ignore messages from Effects
    if (!timestamp) return;

    const paletteIdx = Math.round((palette.length - 1) * this.channelValues[0]);
    const bandWidthType = Math.round(this.channelValues[1] * 2);

    for (let x = 0; x < this.width; ++x)
    {
        const c = this.color(paletteIdx, bandWidthType, this.step + x);
        for (let y = 0; y < this.height; ++y)
        {
            this.set(x, y, c);
        }
    }

    const speed = this.channelValues[2] * 2 - 1; // -1 to 1
    const centerWidth = 0.1;
    if ( speed > centerWidth )
        this.step = (this.step + 1) % this.width;
    else if ( speed < -centerWidth )
        this.step = (this.step + this.width - 1) % this.width;

    let delay = Math.log1p(10 * (1 - Math.abs(speed))) / 5;
    if (delay < 0.03)
        delay = 0.03;
    this.renderDelay = delay;

    window.postMessage([this.id, 0, "frame", this.leds] );
  }

  color(paletteIdx: number, bandWidthType: number, step: number): number[]
  {
      let pos = step % this.width;
      switch (bandWidthType)
      {
          case 0:
              if (pos > 5)
                  return [0,0,0];
              pos %= 3;
              break;

          case 1:
              if (pos > 5)
                  return [0,0,0];
              pos = pos / 2 | 0;
              break;

          case 2:
              if (pos > 2)
                  return [0,0,0];
              break;
      }

      return palette[paletteIdx][pos];
  }
}
