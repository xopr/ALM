import type { IEffect, MinMax, Channels, MessageData } from "../Effect";

const hej = [13, 0, 48]; // DonkerPaars
const hejjer = [62, 0, 255]; // Paars
const krej = [0, 0, 0] // Zwert
const lucht = [50, 50, 50] // Wit

const roeed =  [200, 0, 0]; // Roeed
const gael = [196, 128, 0]; // Gael
const greun = [0, 200, 0]; // Greun

const colors = [hej,krej,lucht,hej,lucht,krej,hej,krej,lucht]
const palette = [
    [roeed, gael, greun,roeed, gael, greun,roeed, gael, greun],
    [hej,krej,lucht,hej,lucht,krej,hej,krej,lucht],
];
function xFade(c1: number[],c2: number[], factor: number): number[]
{
    return [
        (c1[0] * (1-factor) + c2[0] * factor) | 0,
        (c1[1] * (1-factor) + c2[1] * factor) | 0,
        (c1[2] * (1-factor) + c2[2] * factor) | 0
    ];
}

function rangeFade(colors: number[][], factor: number)
{
    // example: 3 colors: 0=color 1, 0.5=color 2, 1=color 3
    const floatingPos = (colors.length - 1) * factor;
    const index = floatingPos | 0;

    return xFade(colors[index], colors[index+1], floatingPos - index);
}

// Note: Effect is available via globalThis
export class Plasma extends Effect implements IEffect {
  static description = "Plasma simulator";
  static channels: Channels = [
    {
      name: "P",
      description: "Palette",
      default: 0,
    },
    {
      name: "B",
      description: "Bandwidth",
      default: 0.5,
    },
    {
      name: "S",
      description: "Speed",
      default: 0.333,
    },
  ];
  static minMax: MinMax = { x: [1, 255], y:[1, 255] };

  public renderDelay = 0.1;
  public channelValues: number[];

  private boundListener: (data: MessageData) => void;

  plasma_counter = 0.0;
  plasma_step_width = 30;
  plasma_cell_size_x = 6;
  plasma_cell_size_y = 6;
  num_col = 1536 / 2;

  constructor(x: number, y: number, channelsPerLed: number, id?: string) {
    super(x, y, channelsPerLed, id);

    this.channelValues = Plasma.channels.map(channel => channel.default);

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

    this.plasma_counter = this.plasma_counter
        + this.channelValues[2] * 10;
        // + this.plasma_step_width / 10.0;
    const calc1 = Math.sin(this.plasma_counter * 0.006);
    const calc2 = Math.sin(this.plasma_counter * -0.06);
    let xc = 25.0;
    for (let x = 0; x < this.width; ++x)
    {
        // xc += this.plasma_cell_size_x / 10.0;
        xc += this.channelValues[1];
        let yc = 25.0;
        const s1 = this.num_col + this.num_col * Math.sin(xc) * calc1;
        for (let y = 0; y < this.height; ++y)
        {
            // yc += this.plasma_cell_size_y / 10.0;
            yc += this.channelValues[1];
            const s2 = this.num_col + this.num_col * Math.sin(yc) * calc2;
            const s3 = this.num_col + this.num_col
              * Math.sin((xc + yc + (this.plasma_counter / 10.0)) / 2.0);
            const pixel = ((s1 + s2 + s3) / 3.0) | 0;
            const c = this.color(pixel);
            this.set(x, y, c);
        }
    }
    window.postMessage([this.id, 0, "frame", this.leds] );
  }

  color(count: number)
  {
      const paletteIdx = Math.round((palette.length - 1) * this.channelValues[0]);
      const colors = palette[paletteIdx];

      return rangeFade(colors, count / 1600)
  }
}
