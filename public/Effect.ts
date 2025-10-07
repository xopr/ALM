export type Type = Array<"1D" | "2D">
export type MinMax = { x: [number, number]; y: [number, number]};

type Channel = {
  name: string;
  default: number; // 0-1
  description?: string;
  // resolution?: number; // step size
  // persistent?: boolean;
};
export type Channels = Channel[];

/**
 * Effect interface
 * NOTE: this interface is heavily in flux and might break existing Effects regularly until further notice
 */
export interface Effect {
  // TODO: try and do static

  /** Compatibility: 1D, 2D */
  // get type(): Type;
  /** Minimum / maximum LEDs per axis supported by the effect; if one axis defines [1,1], it is considered as 1D */
  get minMax(): MinMax;

  // TODO: Color channels? 3:RGB, 4:RGBW, 5:RGBWW

  /** variable channels (0-1?) */
  get channels(): Channels;

  //  resolution?
  // desired refresh rate? -> skip frame feature?
  /** Desired refresh rate in seconds */
  get refreshRate(): number;

  // TODO: might not need to be async
  frame(timestamp: number): void | Promise<void>;

  //reset(): void;
  //cleanup(): void;
}

// document.timeline.currentTime
// "requestAnimationFrame"
