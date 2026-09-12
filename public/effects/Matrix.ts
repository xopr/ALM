import type { IEffect, MinMax, Channels, MessageData } from "../Effect";

const hej = [13, 0, 48]; // DonkerPaars
const hejjer = [62, 0, 255]; // Paars
const krej = [0, 0, 0]; // Zwert
const lucht = [50, 50, 50]; // Wit

const roeed =  [200, 0, 0]; // Roeed
const gael = [196, 128, 0]; // Gael
const greun = [0, 200, 0]; // Greun

class Particle
{
  x: number;
  y: number;
  len: number;
  color: number;
  speed: number;
  speedCount: number;

    constructor(level: number)
    {
        switch (level)
        {
            case 0:
                this.x = Math.random() * 7 | 0;
                this.y = 21;
                this.len = Math.random() * 5 | 0 + 3;
                this.color = level;
                this.speed = 4 * Math.random() | 0 + 2;
                this.speedCount = 0;
                break;
            case 1:
                this.x = Math.random() * 7 | 0;
                this.y = 21;
                this.len = Math.random() * 4 | 0 + 2;
                this.color = level;
                this.speed = 2 * Math.random() * 4 | 0 + 4;
                this.speed = 4;
                this.speedCount = 0;
                break;
            case 2:
                this.x = Math.random() * 7 | 0;
                this.y = 21;
                this.len = Math.random() * 3 | 0 + 2;
                this.color = level;
                this.speed = 2 * Math.random() * 4 | 0 + 4;
                this.speed = 6;
                this.speedCount = 0;
                break;
            default:
              throw new RangeError("Unexpected particle level");
        }
    }
}

// Note: Effect is available via globalThis
export class Matrix extends Effect implements IEffect {
  static description = "How do you define real?";
  static channels: Channels = [
    {
      name: "P",
      description: "Palette",
      default: 0,
    },
    {
      name: "F",
      description: "Foreground speed",
      default: 0.4,
    },
    {
      name: "B",
      description: "Background speed",
      default: 0.6,
    },
  ];

  static minMax: MinMax = { x: [1, 255], y:[1, 255] };

  public renderDelay = 0.05;
  public channelValues: number[];

  private boundListener: (data: MessageData) => void;


  particles: Particle[][] = [[], [], []];
  // numParticles = [35, 35, 8];
  numParticles = [20, 20, 5];
  bgcolor = 0;
  colors = [7, 55, 160];

  constructor(x: number, y: number, channelsPerLed: number, id?: string) {
    super(x, y, channelsPerLed, id);

    this.channelValues = Matrix.channels.map(channel => channel.default);

    this.boundListener = this.onWindowMessage.bind(this);
    window.addEventListener("message", this.boundListener);


    // Initial channel values
    window.postMessage([this.id, 0, "channels", this.channelValues] );

    // TODO: color
    this.clear(/*[0,this.bgcolor,0]*/);

    this.numParticles.forEach((numParticle, level) => {
        for ( let _i = 0; _i < numParticle; ++ _i)
        {
            const p = new Particle(level);
            p.y = Math.random() * 20 | 0;
            this.particles[level].push(p);
        }
    })

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

    // TODO: color
    this.clear(/*[0,this.bgcolor,0]*/);
    this.numParticles.forEach((particles, level) => {
        for ( let i = 0; i < particles; ++ i)
        {
            let p = this.particles[level][i];
            if (p.y <= -p.len)
            {
                p = new Particle(level);
                this.particles[level][i] = p;
            }
            if (p.speedCount <= 0)
            {
                p.y -= 1;
                switch (level)
                {
                  case 1:
                  case 2:
                    p.speedCount = 10 - (this.channelValues[3 - level] * 10 | 0);
                    break;
                }
                // p.speedCount = p.speed;
            }
            else
            {
                p.speedCount -= 1;
            }

            for (let y = 0; y < p.len; ++y)
            {
                const c = ((4 * p.len - 3 * y) * this.colors[p.color]) / (4 * p.len);
                //cc = this.strip2D.get(p.x, p.y + y)[1]
                //if (cc > c)
                //  c = cc
                const color = this.colorFromIntensity(c);
                this.set(p.x, p.y + y, color)
      
            }
        }
    });

    window.postMessage([this.id, 0, "frame", this.leds] );
  }

  colorFromIntensity(c: number): number[]
  {
    const paletteIdx = this.channelValues[0];
    // const bandWidthType = this.channelValues[1];
    if (!paletteIdx)
      return [0, c, 0];

          // if (c > )
    // console.log("c", c);
    if (c > 150)
      return lucht;
    // else if (c > )
    const mej = hej.slice();
    mej[0] = mej[0] * c / 150 | 0;
    mej[1] = mej[1] * c / 150 | 0;
    mej[2] = mej[2] * c / 150 | 0;
    return mej;
  }
}
