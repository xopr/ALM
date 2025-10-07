// import { midiChannels, valueFromMax } from "./midiChannels.js";

import { sleep } from "./async.js";
import { Effect } from "../../public/Effect.js";
import { RgbOctet } from "./led.js";
import { Strip2D } from "./Strip2D.js";

export class Fire2 extends Effect
{
    rdata: number[] = [];
    gdata: number[] = [];
    bdata: number[] = [];
  
    //pcount = 10 // set at init
    maxparticles = 300;
  
    maxbrightness = 255;
    palette = 0;
    restoretime = 0;

    pcount: number;

    constructor(strip2D: Strip2D/*, channelHandler*/)
    {
        super(strip2D/*, channelHandler*/);
        this.strip2D.strip.clear();

        this.pcount = 10;

        this.strip2D.strip.clear([0, 0, 0]);
        this.strip2D.send();
    
        for (let i = 0; i <150; ++i)
        {
            this.rdata[i] = 0;
            this.gdata[i] = 0;
            this.bdata[i] = 0;
        }    
        /** Channel values (0-16384) */
        this.channelValues = [0, 100, 300];
        /** Channel names */
        this.channelNames = ["palette", "particle count", "heat"];
        /** Maximum value to convert 14 bit channel value to */
        this.channelMaxValues = [5, this.maxparticles, 255];
        this.channelZero = [3, 0, 0];
    }

    async run(runtime?: number)
    {
        this.init();
        if (!runtime)
            runtime = Number.MAX_VALUE;

        const particles = [];
        for (let n = 0; n < this.maxparticles; ++n)
            particles[n] = new Particle(this, Math.round(Math.random() * (this.strip2D.lenx)), this.strip2D.leny);

        const starttime = Date.now() / 1000;

        // fd = sys.stdin.fileno()
        // oldterm = termios.tcgetattr(fd)
        // newattr = termios.tcgetattr(fd)
        // newattr[3] = newattr[3] & ~termios.ICANON & ~termios.ECHO
        // termios.tcsetattr(fd, termios.TCSANOW, newattr)

        // oldflags = fcntl.fcntl(fd, fcntl.F_GETFL)
        // fcntl.fcntl(fd, fcntl.F_SETFL, oldflags | os.O_NONBLOCK)

        let heat = 255; // was 0
        while (!this.quit && ((Date.now() / 1000 - starttime) < runtime))
        {
            if (this.quit)
            {
                // if (heat)
                //     heat -= 1;
                if (this.maxbrightness)
                    this.maxbrightness -= 1;
            }
            else //if (this.pcount < this.maxparticles)
            {
                // heat = parseInt( 512 * this.channelValues[1] / this.maxparticles );
                // heat = parseInt( this.channelValues[1] ); // TODO: cv?
                // heat = parseInt( 255 ); // TODO: cv?
                heat = this.channelValues[2];
            }

            if (heat > 255)
                heat = 255;

            //   try:
            //     c = sys.stdin.read(1)
            //     if c == "0":
            //       this.palette = 0
            //     elif c == "1":
            //       this.palette = 1
            //     elif c == "2":
            //       this.palette = 2
            //     elif c == "3":
            //       this.palette = 3
            //     elif c == "4":
            //       this.palette = 4
            //     elif c == "5":
            //       this.palette = 5

            //     elif c == "9":
            //       this.palette = 3
            //       this.restoretime = Date.now() / 1000 + 5
            //     elif c == "q":
            //       print( "quit" )
            //       this.quit = True
            //     elif c == "+" or c == "=":
            //       this.maxbrightness += 1
            //       if this.maxbrightness > 255:
            //         this.maxbrightness = 255
            //     elif c == "-" or c == "_":
            //       this.maxbrightness -= 1
            //       if this.maxbrightness < 1:
            //         this.maxbrightness = 1
            //     elif c == "h":
            //       this.pcount = this.maxparticles - 2
            //     elif c == "l":
            //       this.pcount = 20

            //   except IOError:
            //     pass

            if (this.restoretime && this.restoretime < Date.now() / 1000)
            {
                this.palette = 0;
                this.restoretime = 0;
            }
            // const cv = valueFromMax(this.channelValues[1], this.channelMaxValues[1]);
            const cv = this.channelValues[1];
            
            for (let i = 0; i < cv; ++i)
                particles[i].updateparticle( heat, true );
            for (let i = cv; i < this.maxparticles; ++i)
                particles[i].updateparticle( 255, false );

            for (let i = 0; i < 150; ++i)
            {
                const x = (149 - i) % this.strip2D.lenx;
                const y = Math.round((149 - i) / this.strip2D.lenx);
                const r = Math.round(this.maxbrightness * this.rdata[i] / 255);
                const g = Math.round(this.maxbrightness * this.gdata[i] / 255);
                const b = Math.round(this.maxbrightness * this.bdata[i] / 255);

                this.strip2D.set( x, y, [ r, g, b ] );
            }

            this.strip2D.send();
            this.cleanarray();
            await sleep(0.03);

            // Add new particle
            // if ( this.pcount < this.maxparticles && parseInt(Math.random() * (256 - heat)) < 3 + heat )
            //     this.pcount += 1
        }

        // termios.tcsetattr(fd, termios.TCSAFLUSH, oldterm)
        // fcntl.fcntl(fd, fcntl.F_SETFL, oldflags)
        this.quit = false;
        // this.strip2D.strip.stop();
    }

    cleanarray()
    {
        for (let i = 0; i < 150; ++i)
        {
            this.rdata[i] = 0;
            this.gdata[i] = 0;
            this.bdata[i] = 0;
        }
    }
}


class Particle
{
    rgb?: RgbOctet;
    fire?: Fire2;
    x?: number;
    y?: number;
    rnderp?: number;
    speed?: number;
    life?: number;
    palette?: number;     

    constructor(fire: Fire2, x: number, y: number)
    {
        this.init(fire, x, y);
    }

    init(fire: Fire2, x: number, y: number)
    {
        this.rgb = [0,0,0];
        this.fire = fire;
        this.y = y;
        this.x = x;
        this.rnderp = Math.round(Math.random() * 9); //id(self) % 9;
        this.speed = 1;
        // this.life = random.uniform( 5, this.fire.strip2D.leny - 1 );
        this.life = 5 + Math.random() * (this.fire.strip2D.leny);
        // this.palette = valueFromMax(fire.channelValues[0], fire.channelMaxValues[0]);
        this.palette = fire.channelValues[0];
    }

    updateparticle(heat: number, alive: boolean)
    {
        // Fire goes from white -> yellow -> deep orange
        let life = heat * this.life! / 255;
        if (life < 3)
            life = 3;
        const progress = Math.round(heat * (this.fire!.strip2D.leny - this.y!) / life);
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

        this.intoarray(intx, inty, this.rgb);

        // Reset if particle is done
        if ((this.fire!.strip2D.leny - this.y! ) > life || this.y! > this.fire!.strip2D.leny)
        {
            if (alive)
            {
                const x = Math.round(Math.random() * (this.fire!.strip2D.lenx) )
                this.init(this.fire!, x, this.fire!.strip2D.leny);
            }
            else
                this.rgb = [0,0,0];
        }    
    }

    intoarray(x: number, y: number, rgb: RgbOctet)
    {
        this.fire!.rdata[y * this.fire!.strip2D.lenx + x] = rgb[0];
        this.fire!.gdata[y * this.fire!.strip2D.lenx + x] = rgb[1];
        this.fire!.bdata[y * this.fire!.strip2D.lenx + x] = rgb[2];
   }
  
}

// if (require.main === module)
// {
//     const e = new Fire2(new Strip2D(7, 21), midiChannels);
//     // const e = new Fire2(new Strip2D(14, 18, 17, 13, 15, 12, 7, 3 ));
//     await e.run();
//     // await sleep(0);
//     // process.exit();
// }
