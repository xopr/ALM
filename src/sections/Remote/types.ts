export type MidiMessage = {
  timestamp: number;
  message: [command: Command, note: number, velocity: number];
};

export enum Command {
  "NOTE_OFF" = 0x80,
  "NOTE_ON" = 0x90,
  "AFTER_TOUCH" = 0xA0,
  "CONTINUOUS" = 0xB0, // Rotary
  "PATCH" = 0xC0,
  "PRESSURE" = 0xD0,
  "PITCH" = 0xE0, // Slider 0xEx
  "MISC" = 0xF0,
};

export type MidiConnections = Record<"inputs" | "outputs", Record<string, string>>;


export type ButtonGroup = "m" | "s" | "r" | "b";
type TreeIdPart<
  Depth extends unknown[] = []
> =
  Depth["length"] extends 10
    ? ""
    : `_${number}${TreeIdPart<[...Depth, unknown]> | ""}`;

type TreeId = `${number}${TreeIdPart}`;

/** Emit target */
type Target = TreeId | "selected";
/** Navigation identifier */
type Navigation = TreeId/* | `${"prev" | "next"}${"Group"|"Effect"|"Leaf"}`*/;
/** Local controller item: slider_n | buttonGroup_n_m | button_n | rotary_n */ 
export type Local = `sliders_${number}` | `buttons_${number}` | `buttonGroups_${number}_${ButtonGroup}` | `rotaries_${number}`;

/** MIDI remote Action */
export type Action =
| {
  /** Set selected item */
  name: "selected";
  /** Tree item to select or navigate to */
  target: Navigation;
  /** No data */
  value: never;
}
| {
  /** Emit channel value */
  name: "emit";
  /** Tree item to emit to */
  target: Target;
  /** Effect channel index */
  value: number;
}
| {
  /** Mute channel value */
  name: "mute";
  /** Tree item to emit to */
  target: Target;
  /** Effect channel index */
  value: number;
}
| {
  /** Set local controller value (may cascade actions) */
  name: "local";
  /** Local identifier */
  target: Local;
  /** Value to set */
  value: boolean | number | undefined;
}
| {
  /** Set/clear target effect */
  name: "setEffect";
  /** Tree item to set effect on */
  target: Target;
  /** Name of the effect, empty to clear. Note that toggle will clear on switching off */
  value: string | undefined;
}
| {
  // toggle effect  (target, boolean|undefined) -> includes toggle
  /** Toggle effect */
  name: "toggleEffect";
  /** Tree item to toggle effect on */
  target: Target;
  value: number | undefined;
};
// TODO: set bind scene (needs scene[Action[]])
// TODO: store, recall mute, pause channelValue
export type InternalAction = Partial<Pick<Action, "value">> & Omit<Action, "value">;

export type Button = {
    color?: "white" | "red" | "orange" | "green" | "blue";
    mode?: "follow" | "toggle" | "latch";
    active?: boolean;
    actions?: InternalAction[];
}

export type Slider = {
  value: number;
  actions?: InternalAction[],
  setpoint?: number
};

export type Controller = {
  rotaries: Array<{
    value: number;
    mode?: "regular" | "wrap"
    actions?: InternalAction[];
  }>;
  leds: boolean[];
  sliders: Slider[];
  buttonGroups: Array<Record<ButtonGroup, Button>>;
  buttons: Array<Button & {
    id?: number;
    variant: "play" | "pause" | "record" | "rewind" | "fast forward" | "skip backward" | "skip forward" | "up" | "down" | "left" | "right";
  }>;
}

