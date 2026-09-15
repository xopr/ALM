import type { IEffect, MinMax, Channels, MessageData } from "../Effect";

const hej = [13, 0, 48]; // DonkerPaars
// const hejjer = [62, 0, 255]; // Paars
const krej = [0, 0, 0]; // Zwert
const lucht = [50, 50, 50]; // Wit

const roeed =  [200, 0, 0]; // Roeed
const gael = [196, 90, 0]; // Gael
const greun = [0, 200, 0]; // Greun

const palette = [
    [roeed, gael, greun],
    [lucht, krej, hej],
];

// Note: Effect is available via globalThis
export class Shift extends Effect implements IEffect {
  static description = "Shift pattern up or down";
  static channels: Channels = [
    {
      name: "P",
      description: "Palette",
      default: 0,
    },
    {
      name: "B",
      description: "Bandwidth",
      default: 0.5, // 21
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

    this.channelValues = Shift.channels.map(channel => channel.default);

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

  frame(timestamp: number, _data: ArrayBuffer): void {
    // Migration: ignore messages from Effects
    if (!timestamp) return;

    const paletteIdx = Math.round((palette.length - 1) * this.channelValues[0]);
    const bandWidth = Math.round(this.channelValues[1] * 21);

    for (let y = 0; y < this.height; ++y)
    {
        const c = this.color(paletteIdx, bandWidth, this.step + y);
        this.row(y, y + 1, c);
    }

    const speed = this.channelValues[2] * 2 - 1; // -1 to 1
    const centerWidth = 0.1;
    if ( speed > centerWidth )
        // step = (step + 1) % (3 * this.height);
        this.step -= 1;
    else if ( speed < -centerWidth )
        this.step += 1;
        // step = (step + 3 * this.height - 1) % (3 * this.height);

    let delay = Math.log1p(10 * (1 - Math.abs(speed))) / 5;
    if (delay < 0.03)
        delay = 0.03;
    this.renderDelay = delay;

    window.postMessage([this.id, 0, "frame", this.leds] );
  }

  color(paletteIdx: number, bandWidth: number, step: number): number[]
  {
      const bw = Math.max(bandWidth + 1, 1);
      const colorLength = bw * 3; // Color length
      const gap = Math.max(21 - colorLength, 0);
      const totalLength = colorLength + gap;
      let colorRow = (step % totalLength);
      if (colorRow < 0) colorRow += totalLength;

      const pos = colorRow / bw | 0;

      // NOTE: step can be negative
      // Height is 21+3 to 63 
      // let pos = (step % ( 3 * this.strip2D.leny)) / (bandWidth + 1) | 0;
      if (pos > palette.length)
          return [0,0,0];

      return palette[paletteIdx][2 - pos];
  }    
}
