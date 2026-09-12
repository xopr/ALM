export class EffectHelper {
  id: string; // Used for non-worker post message

  protected leds: ArrayBuffer;
  protected width: number;
  protected height: number;
  protected channelsPerLed: number;

  constructor(x: number, y: number, channelsPerLed: number, id?: string) {
    this.width = x;
    this.height = y;
    this.channelsPerLed = channelsPerLed;
    this.id = id ?? (Math.random() + 1).toString(36).substring(2);
    this.leds = new ArrayBuffer(x * y * channelsPerLed);
  }

  // TODO: color
  clear() {
    const view = new Uint8Array(this.leds);
    for (let c = 0; c < view.length; ++c) {
      view[c] = 0;
    }
  }

  get(x: number, y: number): number[] {
    const view = new Uint8Array(this.leds);
    const pos = this.channelsPerLed * (x + this.width * (this.height - y));

    return Array.from(view.slice(pos, this.channelsPerLed));
  }

  set(x: number, y: number, color: number[]) {
    const view = new Uint8Array(this.leds);
    const pos = this.channelsPerLed * (x + this.width * (this.height - y));

    for (let c = 0; c < this.channelsPerLed; ++c) {
      view[pos + c] = color[c] ?? 0;
    }
  }

  row(start: number, end: number, color: number[]) {
    if (start > end) return; // Nope

    for (let y = start; y < end; ++y) {
      for (let x = 0; x < this.width; ++x) {
        this.set(x,y,color);
      }
    }
  }

  // pattern(colors: number[][]);

  rotu() {
    const view = new Uint8Array(this.leds);

    // Store first line
    const firstLine = Array.from(view.slice(0, this.channelsPerLed * this.width));

    for (let y = 0; y < this.height - 1; ++y) {
      for (let x = 0; x < this.width; ++x) {
        for (let c = 0; c < this.channelsPerLed; ++c) {

          const pos1 = this.channelsPerLed * (x + this.width * y) + c;
          const pos2 = this.channelsPerLed * (x + this.width * (y + 1)) + c;
          view[pos1] = view[pos2];

          if (y + 2 === this.height) {
            // Restore first line as last line
            view[pos2] = firstLine[this.channelsPerLed * x + c];
          }
        }
      }
    }
  }

  // rotd();
  // rotl();
  // rotr();
  // fade(factor: number);

};
