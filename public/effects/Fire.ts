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

export class Fire implements IEffect {
  static description = "Turns all LEDs the same color.";
  static channels: Channels = [
    {
      name: "P",
      description: "Palette",
      default: 0, // TODO: max: 5
    },
    {
      name: "C",
      description: "Particle count",
      default: 0.3333, // TODO: max: maxparticles=300
    },
    {
      name: "H",
      description: "Heat",
      default: 1, // TODO: max: 255
    },
  ];
  static minMax: MinMax = { x: [1, 255], y:[1, 255] };
  static refreshRate = 0.03

  channelValues: number[];
  id: string; // Used for non-worker post message

  private leds: ArrayBuffer;
  private boundListener: (data: MessageData) => void;

  // Ported from OHM code
  //pcount = 10 // set at init
  maxparticles = 300;

  maxbrightness = 255;
  palette = 0;
  restoretime = 0;

  pcount: number;

  particles: Particle[];

  width: number;
  height: number;
  // Ported from OHM code


  constructor(x: number, y: number, channels: number, id?: string) {
    console.log("Constructor", x, y, channels, id);

    this.channelValues = Fire.channels.map(channel => channel.default);
    // HACK: channel amount
    this.channelValues.length = channels;

    this.id = id ?? (Math.random() + 1).toString(36).substring(2);
    this.leds = new ArrayBuffer(x * y * channels);

    this.boundListener = this.onWindowMessage.bind(this);
    window.addEventListener("message", this.boundListener);

    // Ported from OHM code
    // super(strip2D/*, channelHandler*/);
    // this.strip2D.strip.clear();

    this.pcount = 10;

    // this.strip2D.strip.clear([0, 0, 0]);
    // this.strip2D.send();
    
    console.log("create particles");
    this.particles = [];
    for (let n = 0; n < this.maxparticles; ++n) {
      this.particles[n] = new Particle(
        Math.round(Math.random() * x),
        y,
        x,
        y,
        Math.round(this.channelValues[0] * 5),
      );
    }
    // Ported from OHM code
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

    // Ported from OHM code
    const heat = Math.round(this.channelValues[2] * 255); // maxHeat
    const cv = Math.round(this.channelValues[1] * this.maxparticles);
    const palette = Math.round(this.channelValues[0] * 5);

    if (!this.particles || !this.particles.length) {
      console.log("empty particles", this.particles);
      return;
    }

    // Clear canvas
    for (let i = 0; i < view.length; ++i) {
      view[i] = 0;
    }

    for (let i = 0; i < cv; ++i) {
      this.particles[i].updateparticle( heat, true, palette, view, !i );
    }
    for (let i = cv; i < this.maxparticles; ++i) {
      // This is the "poof" magic: heat = 255
      this.particles[i].updateparticle( 255, false, palette, view, i === cv );
    }
    // Ported from OHM code

    // for (let i = 0; i < view.length; i += 3/*channels*/) {
    //     this.channelValues.forEach((v, c) => {
    //         view[i + c] = Math.round(255 * v); // G
    //     })
    // }

    window.postMessage([this.id, 0, "frame", this.leds] );
    // Hand over the leds buffer
    // window.postMessage([this.id, 0, this.leds], { transfer: [this.leds] } );
  }
}

// Parent:
// const myWorker = new Worker("/worker.js");


type RgbOctet = [r: number, g: number, b: number];

// Ported from OHM code
class Particle
{
    rgb?: RgbOctet;
    x?: number;
    y?: number;
    rnderp?: number;
    speed?: number;
    life?: number;
    palette?: number;
    
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number, palette: number)
    {
      this.width = width;
      this.height = height;
      this.init(x, y, palette);
    }

    init(x: number, y: number, palette: number)
    {
        this.rgb = [0,0,0];
        this.y = y;
        this.x = x;
        this.rnderp = Math.round(Math.random() * 9);
        this.speed = 1;
        this.life = 5 + Math.round(Math.random() * this.height);
        this.palette = palette;
    }

    updateparticle(heat: number, alive: boolean, palette: number, view: Uint8Array, debug: boolean)
    {
        // Fire goes from white -> yellow -> deep orange
        let life = Math.round(heat * this.life! / 255);
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

        debug && console.log(alive, intx, inty, this.rgb);
        this.intoarray(view, intx, inty, this.rgb);

        // Reset if particle is done
        if ((this.height - this.y! ) > life || this.y! > this.height)
        {
            if (alive)
            {
              const x = Math.round(Math.random() * this.width);
              debug && console.log("reset alive", x, this.height, palette);
              this.init(x, this.height, palette);
            }
            else {
              // debug && console.log("reset dead");
              this.rgb = [0,0,0];
            }
        }    
    }

    intoarray(view: Uint8Array, x: number, y: number, rgb: RgbOctet)
    {
      // TODO: do this.channelValues.length
      const offset = 3 * (y * this.width + x);
      view[offset + 0] = rgb[0];
      view[offset + 1] = rgb[1];
      view[offset + 2] = rgb[2];
    }
  
}
// Ported from OHM code
