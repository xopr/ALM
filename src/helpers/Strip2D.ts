import { RgbOctet } from "./led";
import { AddressListUnsanitized } from "./migrationFunctions";
import { Strip } from "./Strip";

/**
 * The Strip2D class defines operations on a 2-dimensional led banner and
 * maps it to a Strip.
 * This can be initialized in 2 ways.
 *
 * 1. for a cylinder, 7 pixels circumference,
 *    21 pixels high spiral from top to bottom clockwise (from top):
 * s = Strip2D(7, 21)
 *
 * 2. for a cone, with 6 pixels circumference,
 *    arbitrary heights (max. 21) zig-zag from bottom to top clockwise (from top):
 * s = Strip2D( 21, 18, 17, 15, 15, 17 )
 *
 * Note that the zig-zag style cannot use any of the `rot*` methods
 * since moving from one height to a different will cause loss of pixel information
 */
export class Strip2D
{
    lenx = 0;
    leny = 0;
    lengths: number[] | undefined = undefined;
    fadeCount = 0;
    strip: Strip;
    f: number[];
  
    /**
     * Constructor, defining a led banner of width lenx and height leny.
     *
     * @param {*} lenx 
     * @param {*} leny 
     * @param  {...any} args zigzag lengths and optional address array.
     */
    constructor(lenx: number, leny: number, ...args: number[]/*, addr*/)
    {
        // TODO: verify. we don't have named arguments so we need to do addr magic
        const addr = Array.isArray(args[args.length - 1]) ? args.pop() as unknown as AddressListUnsanitized : undefined;

        if (args.length > 0)
        {
            // Vertical zig-zag string of lengths
            this.lengths = []
            this.lengths.push( lenx );
            this.lengths.push( leny );

            if (lenx > leny)
                this.lenx = lenx;
              else
                this.lenx = leny;

            args.forEach(arg => {
                this.lengths?.push( arg );
                if (arg > this.lenx)
                    this.lenx = arg;
            });

            this.leny = this.lengths.length;
        }
        else
        {
            // Regular (spiral) layout
            this.lenx = lenx;
            this.leny = leny;    
        }

        // this.strip = Strip(lenx * leny, addr)
        this.strip = new Strip(150, addr);
        // this.f = [.20 * math.sin(math.pi * i / 26) for i in range(1, 12)]
        this.f = [0.02, 0.03, 0.05, 0.09, 0.10, 0.11, 0.12, 0.13, 0.17, 0.19, 0.20];
    }

    /**
     * Send data to the strip
     */
    send()
    {
        // TODO: verify statement
        if (!this.lengths?.length)
        {
            for (let i = this.lenx * this.leny; i < this.strip.length; ++i)
                this.strip.set(i, [0, 0, 0])
        }
       this.strip.send();
    }

    /**
     * Set the color of the led at (x, y).
     *
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number[]} color 
     */
    set(x: number, y: number, color: RgbOctet)
    {
        let pos;

        if (this.lengths)
        {
            // Vertical zig-zag string of lengths
            if (y >= this.lengths.length)
                return;
            if (x >= this.lengths[y])
                return;

            pos = 149;

            for (let vert = 0; vert < y; ++vert)
                pos -= this.lengths[vert];
            if ( y % 2 === 0)
                pos -= x;
            else
                pos += x - this.lengths[y] + 1;
        }
        else
        {
            // Regular (spiral) layout
            pos = x + y * this.lenx;
        }

        this.strip.set(pos, color);
    }

    /**
     * Get the color of the led at (x, y).
     *
     * @param {Number} x 
     * @param {Number} y 
     * @returns {Number[]} the color
     */
    get(x: number,y: number): RgbOctet
    {
        let pos = 0;
        if (this.lengths)
        {
            // Vertical zig-zag string of lengths
            if (y >= this.lengths.length)
                return [0,0,0];
            if (x >= this.lengths[y])
                return [0,0,0];

            pos = 149;

            for (let vert = 0; vert < y; ++vert)
                pos -= this.lengths[vert];
            if ( y % 2 === 0)
                pos -= x;
            else
                pos += x - this.lengths[y] + 1;
        }
        else
        {
            // Regular (spiral) layout
            pos = x + y * this.lenx;
        }
        return this.strip.get(pos);
    }

    /**
     * Rotate the banner contents 1 led to the right.
     */
    rotr()
    {
        for (let y = 0; y < this.leny; ++y)
        {
            // TODO: lenx - 1?
            const c = this.get(this.lenx - 1, y);
            for (let x = this.lenx - 2; x >= 0; --x)
                this.set(x + 1, y, this.get(x, y))
            this.set(0, y, c)
        }
    }

    /**
     * Rotate the banner contents 1 led to the left.
     */
    rotl()
    {
        for (let y = 0; y < this.leny; ++y)
        {
            // TODO: lenx - 1?
            const c = this.get(0, y);
            for (let x = 0; x < this.lenx - 1; ++x)
                this.set(x, y, this.get(x + 1, y))
            this.set(this.lenx - 1, y, c)
        }
    }

    /**
     * Rotate the banner contents 1 led up.
     */
    rotu()
    {
        const c = this.strip.getm((this.leny - 1) * this.lenx, this.lenx);
        for (let y = this.leny - 2; y >= 0; --y)
        {
            this.strip.setm((y + 1) * this.lenx,
                this.strip.getm(y * this.lenx, this.lenx));
        }
        this.strip.setm(0, c);
        // this.strip.setm(0, [[10,10,10]]);
    }

    /**
     * Rotate the banner contents 1 led down.
     */
    rotd()
    {
        const c = this.strip.getm(0, this.lenx)
        for (let y = 0; y < this.leny - 1; ++y)
        {
            this.strip.setm(y * this.lenx,
                this.strip.getm((y + 1) * this.lenx, this.lenx));
        }
        this.strip.setm((this.leny - 1) * this.lenx, c);
    }

    /**
     * Set pattern for every y increment with step.
     *
     * @param {*} data 
     * @param {*} step 
     */
    pattern(data: RgbOctet[], step = 1)
    {
        for (let y = 0; y < this.leny; ++y)
        {
            for (let x = 0; x < this.lenx; ++x)
            {
                this.set(x, y, data[(x + y * step) % this.lenx]);
            }
        }
    }

    /**
     * Set block of rows.
     *
     * @param {*} data 
     * @param {*} step 
     */
    row(start: number, stop: number, color: RgbOctet)
    {
        for (let y = start; y < stop; ++y)
        {
            for (let x = 0; x < this.lenx; ++x)
            {
                this.set(x, y, color);
            }
        }
    }

    /**
     * Fade that strip by a factor a
     *
     * @param {Number} a 
     */
    fade(a: number)
    {
        for (let y = 0; y < this.leny;++y)
        {
            for (let x = 0; x < this.lenx; ++x)
            {
                let p = this.get(x, y);
                p[0] = Math.round(p[0] * a);
                p[1] = Math.round(p[1] * a);
                p[2] = Math.round(p[2] * a);
                console.log(a, p);
                this.set(x, y, p);
            }
        }
    }

    /**
     * 
     * @param {*} yy 
     */
    coneFade(yy: number)
    {
        for (let y_position = 0; y_position <this.leny; ++y_position)
        {
            let f;
            if (Math.abs(y_position - yy) >= this.f.length)
                f = this.f[this.f.length - 1];
            else
                f = this.f[Math.abs(y_position - yy)];
            for (let x_position = 0; x_position < this.lenx; ++x_position)
            {
                let c = this.get(x_position, y_position);
                c = [Math.round(c[0] * f), Math.round(c[1] * f), Math.round(c[2] * f)];
        
                this.set(x_position, y_position, c);
                this.set(x_position, y_position, c);
            }
        }
    }
}
