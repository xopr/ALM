#!/usr/bin/env bun

import { IEffect } from "../../public/Effect";
import { Strip2D } from "./Strip2D";

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
                this.speed = 2 * Math.random() * 2 | 0 + 2;
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
                throw new RangeError(`Level ${level} not supported`);
        }
    }
}

export class Matrix extends IEffect
{
    particles: [p1: Particle[], p2: Particle[], p3: Particle[]] = [[], [], []];
    numParticles = [35, 35, 8];
    bgcolor = 0;
    colors = [7, 55, 160];

    constructor(strip2D: Strip2D)
    {
        super(strip2D);
        this.strip2D.strip.clear([0,this.bgcolor, 0]);
        this.strip2D.send();
        this.numParticles.forEach((numParticle, level) => {
            for ( let _i = 0; _i < numParticle; ++ _i)
            {
                const p = new Particle(level);
                p.y = Math.random() * 20 | 0;
                this.particles[level].push(p);
            }
        })
    }

    async step(_count: number)
    {
        this.strip2D.strip.clear([0,this.bgcolor,0]);

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
                    p.speedCount = p.speed;
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
                    this.strip2D.set(p.x, p.y + y, [0, c, 0])
          
                }
            }
        });

        this.strip2D.send();
    }
}

// const e = new Matrix(new Strip2D(7,21));
// const e = new Matrix(new Strip2D(14, 18, 17, 13, 15, 12, 7, 3 ));
// e.run();
