import { Artnet } from "./ArtNet_migrate";
import { RgbOctet } from "./led";
import { AddressListUnsanitized } from "./migrationFunctions";

/**
 * The Strip class defines operations for a 1-dimensional string of leds.
 */
export class Strip
{
    length = 0;
    rgb: RgbOctet[] = []; // TODO: move to constructor?

    artnet: Artnet;

    /**
     * Constructor, creating a strip of length leds.
     * @param {Number} length 
     * @param {*} addr 
     */
    constructor(length: number, addr?: AddressListUnsanitized)
    {
        this.length = length;
        this.clear();
        this.artnet = new Artnet(addr);

        // Global strip -> moved to Effect to trigger quit boolean
        // strip = this;
    }

    /**
     * Stop this strip
     */
    stop()
    {
        // if (typeof this.globalStop === "function")
        //     this.globalStop(this);
        this.artnet.close();
    }

    /**
     * Send the data of myself to the strip
     */
    send()
    {
        this.artnet.send(this);
    }

    /**
     * Clear the entire strip with one color (default: black).
     * @param {Number[]} color is array: [r, g, b].
     */
    clear(color?: RgbOctet)
    {
        const [r, g, b] = color?.length ? color : [0,0,0];
        this.rgb = new Array(this.length).fill([r,g,b]);
    }

    /**
     * Set led at index to color.
     *
     * @param {Number} index 
     * @param {Number[]} color 
     * @param {Number} alpha 
     * @returns 
     */
    set(index: number, color: RgbOctet, alpha = -1)
    {
        if ((index < 0) || (index >= this.length))
            return;

        /*
        if alpha >= 0:
        c = this.get(index)
        if c[0] > 0 and c[1] > 0 and c[2] > 0:
          alpha = float(alpha) / 255.0
          r = int(alpha * r + (1 - alpha) * c[0])
          g = int(alpha * g + (1 - alpha) * c[1])
          b = int(alpha * b + (1 - alpha) * c[2])
          if r > 255:
            r = 255
          if g > 255:
            g = 255
          if b > 255:
            b = 255
        */

        const [r, g, b] = color;
        this.rgb[this.length - 1 - index] = [r, g, b];
    }

    /**
     * Get color of led at index.
     * @param {Number} index 
     */
    get(index: number): RgbOctet
    {
        if ((index < 0) || (index >= this.length))
            return [0,0,0];

        const [r, g, b] = this.rgb[this.length - 1 - index];
        return [r,g,b];
    }

    /**
     * Set a range of leds starting at index to the specified colors.
     *
     * @param {Number} index 
     * @param {Number[][]} colors 
     */
    setm(index: number, colors: RgbOctet[])
    {
        const length = colors.length;
        for (let i = 0; i < length; ++i)
            this.set(index + i, colors[i]);
    }

    /**
     * Get the colors of a range of leds starting at index up to given length.
     * @param {*} index 
     * @param {*} length 
     */
    getm(index: number, length: number)
    {
        const a = [];
        for (let i = 0; i < length; ++i)
            a.push(this.get(index + i));
        return a;
    }

    /**
     * Fade that strip by a factor a
     * @param {*} a 
     */
    fade(a: number)
    {
        for (let i = 0; i <this.length; ++i)
        {
            let [r, g, b] = this.rgb[i];
            r = Math.round(r * a);
            g = Math.round(g * a);
            b = Math.round(b * a);
            this.rgb[i] = [r, g, b];
        }
    }

    /**
     * Print strip contents to stdout.
     */
    print_()
    {
        /*
        for i in range(this.length):
        print("strip ", i, this.rgb[i][0], this.rgb[i][1], this.rgb[i][2])
        */
    }
}