import type { IEffect, MinMax, Channels, MessageData } from "../Effect";

const { abs, min, max, round } = Math;

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from https://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h: number, s: number, l: number): number[]
{
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1/3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1/3);
    }

    return [round(r * 255), round(g * 255), round(b * 255)];
}

function hueToRgb(p: number, q: number, t: number): number
{
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

function transitionCurve(x: number, c: number): number
{
    return x < 0.5 ? Math.pow(2, c - 1) * Math.pow(x, c) : 1 - Math.pow(-2 * x + 2, c) / 2;
}

function flashCurveToFactor(count: number, flash: number, curve: number): number
{
    // Flash off
    if (!flash)
        return 1;

    // TODO: determine fade value against curve
    const roundtrip = count % (2 * flash);
    let f = (roundtrip > flash ? flash - roundtrip : roundtrip) / flash;

    // Negative values are the "Return" path
    if (f < 0)
        f = 1 + f;

    return curve ? transitionCurve(f, Math.pow(curve, 0.54)) : f;
}

// Note: Effect is available via globalThis
export class HSL extends Effect implements IEffect {
  static description = "Hue Saturation Lightness";
  static channels: Channels = [
    {
      name: "H",
      description: "Hue",
      default: 0,
    },
    {
      name: "S",
      description: "Saturation",
      default: 1, // 255
    },
    {
      name: "L",
      description: "Lightness",
      default: 40 / 1024,
    },
    {
      name: "F",
      description: "Flash",
      default: 0, // 255
    },
    {
      name: "C",
      description: "Curve",
      default: 0, // 255
    },
    {
      name: "T",
      description: "Top",
      default: 1, // 128
    },
    {
      name: "B",
      description: "Bottom",
      default: 0, // 128
    },
  ];
  static minMax: MinMax = { x: [1, 255], y:[1, 255] };

  public renderDelay = 0.05;
  public channelValues: number[];

  private boundListener: (data: MessageData) => void;

  constructor(x: number, y: number, channelsPerLed: number, id?: string) {
    super(x, y, channelsPerLed, id);

    this.channelValues = HSL.channels.map(channel => channel.default);

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
          // Refreshrate is fast enough
          // this.frame(timestamp, this.leds);
        }
        break;
    }
  }

  frame(timestamp: number, data: ArrayBuffer): void {
    // Migration: ignore messages from Effects
    if (!timestamp) return;

    // Hue loops around
    // if (this.channelValues[0] > this.channelMaxValues[0])
    //     this.channelValues[0] = 0;
    // if (this.channelValues[0] < 0)
    //     this.channelValues[0] = this.channelMaxValues[0];

    // for (let c = 1; c < this.channelValues.length; ++c)
    // {
    //     if (this.channelValues[c] < 0)
    //         this.channelValues[c] = 0;
    //     else if (this.channelValues[c] > this.channelMaxValues[c])
    //         this.channelValues[c] = this.channelMaxValues[c];
    // }
    const count = timestamp / 50 | 0;
    const curveFactor = flashCurveToFactor(count, this.channelValues[3] * 128 | 0, this.channelValues[4] * 255 | 0);

    // TODO: add flash/curve
    const color = hslToRgb(
        this.channelValues[0],
        this.channelValues[1],
        this.channelValues[2] * curveFactor,
    );

    this.clear();
    if ( this.channelValues[6] <= this.channelValues[5])
    {
        for (let y = this.channelValues[6] * this.height | 0; y < (this.channelValues[5] * this.height | 0); ++y)
            this.row(y, y + 1, color);
    }

    window.postMessage([this.id, 0, "frame", this.leds] );
  }
}
