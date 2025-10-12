import { ClassConstructor } from "../src/helpers/classFileHelpers";

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

type EffectStatics = {
  /** Description of what this effect can do. */
  description: string;

  /** Compatibility: 1D, 2D */
  type: Type;

  // TODO: Color channels? 3:RGB, 4:RGBW, 5:RGBWW

  /** Minimum / maximum LEDs per axis supported by the effect; if one axis defines [1,1], it is considered as 1D */
  minMax: MinMax;

  /** variable channels (0-1?) */
  channels: Channel[];

  /** Desired refresh rate in seconds */
  refreshRate: number;
}

export type Effect = ClassConstructor<IEffect, any, EffectStatics>;

/**
 * Effect interface
 * NOTE: this interface is heavily in flux and might break existing Effects regularly until further notice
 */
export interface IEffect {
  // TODO: might not need to be async
  frame(timestamp: number): void | Promise<void>;

  //reset(): void;
  //cleanup(): void;
}

// document.timeline.currentTime
// "requestAnimationFrame"
