import type { IEffect, MinMax, Channels, MessageData } from "../Effect";

export class Fire implements IEffect {
  static description = "Famous OHM2013 fire animation by Prodigity.";
  static channels: Channels = [
    {
      name: "P",
      description: "Palette",
      default: 0, // max: 5
    },
    {
      name: "C",
      description: "Particle count",
      default: 0.3333, // max: 300
    },
    {
      name: "H",
      description: "Heat",
      default: 1, // max: 255
    },
  ];
  static minMax: MinMax = { x: [1, 255], y:[1, 255] };
  static refreshRate = 0.03

  channelValues: number[];
  id: string; // Used for non-worker post message

  private leds: ArrayBuffer;
  private boundListener: (data: MessageData) => void;

  maxParticles = 300;
  maxHeat = 255;
  maxPalette = 5;
  
  pcount: number;

  particles: Particle[];

  width: number;
  height: number;

  constructor(x: number, y: number, channels: number, id?: string) {
    this.channelValues = Fire.channels.map(channel => channel.default);
    // HACK: channel amount ???
    this.channelValues.length = channels;

    this.id = id ?? (Math.random() + 1).toString(36).substring(2);
    this.leds = new ArrayBuffer(x * y * channels);

    this.boundListener = this.onWindowMessage.bind(this);
    window.addEventListener("message", this.boundListener);

    this.pcount = 10;

    this.particles = [];
    for (let n = 0; n < this.maxParticles; ++n) {
      this.particles[n] = new Particle(
        Math.round(Math.random() * x),
        y,
        x,
        y,
        Math.round(this.channelValues[0] * 5),
        this.maxHeat,
      );
    }

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
          // this.frame(timestamp, this.leds);
        }
        break;
    }
  }

  frame(timestamp: number, data: ArrayBuffer): void {
    // Migration: ignore messages from Effects
    if (!timestamp) return;

    this.leds = data;
    const view = new Uint8Array(this.leds);
    const heat = Math.round(this.channelValues[2] * this.maxHeat);
    const cv = Math.round(this.channelValues[1] * this.maxParticles);
    const palette = Math.round(this.channelValues[0] * this.maxPalette);

    if (!this.particles || !this.particles.length) {
      return;
    }

    // Clear canvas
    for (let i = 0; i < view.length; ++i) {
      view[i] = 0;
    }

    for (let i = 0; i < cv; ++i) {
      this.particles[i].updateParticle( heat, true, palette, view, !i );
    }
    for (let i = cv; i < this.maxParticles; ++i) {
      // This is the "poof" magic: heat = 255
      this.particles[i].updateParticle( this.maxHeat, false, palette, view, i === cv );
    }

    window.postMessage([this.id, 0, "frame", this.leds] );
  }
}

// Parent:
// const myWorker = new Worker("/worker.js");


type RgbOctet = [r: number, g: number, b: number];

class Particle
{
    rgb?: RgbOctet;
    x?: number;
    y?: number;
    speed?: number;
    life?: number;
    palette?: number;
    maxHeat: number;
    
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number, palette: number, maxHeat: number)
    {
      this.maxHeat = maxHeat;
      this.width = width;
      this.height = height;
      this.init(x, y, palette);
    }

    init(x: number, y: number, palette: number)
    {
        this.rgb = [0,0,0];
        this.y = y;
        this.x = x;
        this.speed = 1;
        this.life = 5 + Math.round(Math.random() * this.height);
        this.palette = palette;
    }

    updateParticle(heat: number, alive: boolean, palette: number, view: Uint8Array, debug: boolean)
    {
        // Fire goes from white -> yellow -> deep orange
        let life = Math.round(heat * this.life! / this.maxHeat);
        if (life < 3)
            life = 3;
        const progress = Math.round(heat * (this.height - this.y!) / life);
        let color = heat - progress;
        if (color < 0)
            color = 0;

        let r = 5 + color * 2;
        if (r > 255)
            r = 255;

        let g = (color - 92) * 2;
        if (g > 255)
            g = 255;
        if (g < 0)
            g = 0;

        let b = (color - 191) * Math.floor(Math.random() * 4);
        if (b > 255)
            b = 255;
        if (b < 0)
            b = 0;

        let temp;
        if (this.palette == 1)
        {
            // turquoise blue BGR
            temp = r;
            r = b;
            b = temp;
        }
        else if (this.palette == 2)
        {
            // yellow green GRB
            temp = r;
            r = g;
            g = temp;
        }
        else if (this.palette == 3)
        {
            // pink blue GBR
            temp = r;
            r = g;
            g = b;
            b = temp;
        }
        else if (this.palette == 4)
        {
            // purple red RBG
            temp = b;
            b = g;
            g = temp;
        }
        else if (this.palette == 5)
        {
            // turqoise green BRG
            temp = r;
            r = b;
            b = g;
            g = temp;
        }

        this.rgb = [r, g, b]
        this.y! -= this.speed!;

        const intx = Math.round(this.x!);
        const inty = Math.round(this.y!);

        this.intoArray(view, intx, inty, this.rgb);

        // Reset if particle is done
        if ((this.height - this.y! ) > life || this.y! > this.height)
        {
            if (alive)
            {
              const x = Math.round(Math.random() * this.width);
              this.init(x, this.height, palette);
            }
            else {
              // debug && console.log("reset dead");
              this.rgb = [0,0,0];
            }
        }    
    }

    intoArray(view: Uint8Array, x: number, y: number, rgb: RgbOctet)
    {
      // Note: we are ignoring this.channelValues.length; RGB only
      const offset = 3 * (y * this.width + x);
      view[offset + 0] = rgb[0];
      view[offset + 1] = rgb[1];
      view[offset + 2] = rgb[2];
    }
  
}
