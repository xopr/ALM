import { invoke } from "@tauri-apps/api/core";
import { Component, createEffect, createSignal, For, on, onCleanup, onMount, Show } from "solid-js";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { createStore } from "solid-js/store";
import { ControllerChannel } from "../components/Controller/ControllerChannel";
import { ControllerButton } from "../components/Controller/ControllerButton";

type MidiMessage = {
  timestamp: number;
  message: [command: Command, note: number, velocity: number];
};

enum Command {
  "NOTE_OFF" = 0x80,
  "NOTE_ON" = 0x90,
  "AFTER_TOUCH" = 0xA0,
  "CONTINUOUS" = 0xB0, // Rotary
  "PATCH" = 0xC0,
  "PRESSURE" = 0xD0,
  "PITCH" = 0xE0, // Slider 0xEx
  "MISC" = 0xF0,
};

type MidiConnections = Record<"inputs" | "outputs", Record<string, string>>;


type ButtonGroup = "m" | "s" | "r" | "b";
type TreeIdPart<
  Depth extends unknown[] = []
> =
  Depth["length"] extends 10
    ? ""
    : `_${number}${TreeIdPart<[...Depth, unknown]> | ""}`;

type TreeId = `${number}${TreeIdPart}`;

/** Emit target */
type Target = TreeId | "current" | "selected";
/** Navigation identifier */
type Navigation = TreeId/* | `${"prev" | "next"}${"Group"|"Effect"|"Leaf"}`*/;
/** Local controller item: slider_n | buttonGroup_n_m | button_n | rotary_n */ 
type Local = `slider_${number}` | `buttonGroup_${number}_${ButtonGroup}` | `rotary_${number}`;

// TODO:
// slider LED is lock/setpoint value:
// void invoke("trigger_note", { c: Command.NOTE_ON + 80 + idx, n: 0, v: a ? 127 : 0 });

export type Action =
| {
  // set effect     (target, effect|undefined) -> includes remove
  name: "setEffect";
  target: Target;
  value: string;
}
| {
  // toggle effect  (target, boolean|undefined) -> includes toggle
  name: "toggleEffect";
  target: Target;
  value: boolean | undefined;
}
| {
  // emit channel   (target, channelIdx) -> the effect channel index
  name: "emit";
  target: Target;
  value: number;
}
| {
  // set local      (local, boolean|number|undefined) -> probably cascades effects
  name: "local";
  target: Local;
  value: boolean | number | undefined;
}
| {
  // set current    (navigation)
  name: "current";
  target: Navigation;
  value: never; // undefined?
};
// TODO: set bind scene (needs scene[Action[]])
// TODO: store, recall mute, pause channelValue

type Button = {
    color?: "white" | "red" | "orange" | "green" | "blue";
    mode?: "follow" | "toggle" | "latch";
    active?: boolean;
    actions?: Action[];
}

type Controller = {
  rotaries: Array<{
    value: number;
    mode?: "regular" | "wrap"
    actions?: Action[];
  }>;
  sliders: Array<{ value: number; actions?: Action[], setpoint?: number }>;
  buttonGroups: Array<Record<ButtonGroup, Button>>;
  buttons: Array<Button & {
    id?: number;
    variant: "play" | "pause" | "record" | "rewind" | "fast forward" | "skip backward" | "skip forward" | "up" | "down" | "left" | "right";
  }>;
}

let unlisten: UnlistenFn;
const [connection, setConnection] = createSignal<string>();


const getButtonGroupIndex = (idx: number): { channel: number, button: ButtonGroup } => {
  const channel = idx % 8;
  const ret = { channel, button: "m" as ButtonGroup};
  const button = idx / 8 | 0;
  switch (button) {
    case 0:
      ret.button = "r";
      break;
    case 1:
      ret.button = "s";
      break;
    case 2:
      ret.button = "m";
      break;
    case 3:
      ret.button = "b";
      break;
  }
  return ret;
}

const getRotaryStepIndex = (note: number, velocity: number): { step: number, index: number } => {
  // 16-23 rotaries velocity up=1, dn=65
  // 1: fast up velocity = channel
  // 65: fast down
  switch (velocity) {
    case 1: return { step: 0.00003, index: note - 16 };
    case 65: return { step: -0.00003, index: note - 16 };
    default:
      return { step: 33 - note, index: velocity > 1 ? -0.02 : 0.02 };
  }
}

type Props = {
  onData?: <T extends Action = Action>(name: T["name"], target: T["target"], value: T["value"], index?: number) => void;
}

export const Remote: Component<Props> = (props) => {
  console.log("component load");
  const [devices, setDevices] = createStore<MidiConnections>({ inputs: {}, outputs: {} });
  const [controller, setController] = createStore<Controller>({
    rotaries: [
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
    ],
    sliders: [
      { value: 0, actions: [{name: "emit", target: "0_0", value: 0}] },
      { value: 0, actions: [{name: "emit", target: "0_0", value: 1}] },
      { value: 0, actions: [{name: "emit", target: "0_0", value: 2}] },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
    ],
    buttonGroups: [
      {
        m: {color: "orange", mode: "toggle"},
        s: {color: "blue"},
        r: {color: "red"},
        b: {}
      },
      {
        m: {color: "orange"},
        s: {color: "blue"},
        r: {color: "red"},
        b: {}
      },
      {
        m: {color: "orange"},
        s: {color: "blue"},
        r: {color: "red"},
        b: {}
      },
      {
        m: {color: "orange"},
        s: {color: "blue"},
        r: {color: "red"},
        b: {}
      },
      {
        m: {color: "orange"},
        s: {color: "blue"},
        r: {color: "red"},
        b: {}
      },
      {
        m: {color: "orange"},
        s: {color: "blue"},
        r: {color: "red"},
        b: {}
      },
      {
        m: {color: "orange"},
        s: {color: "blue"},
        r: {color: "red"},
        b: {}
      },
      {
        m: {color: "orange"},
        s: {color: "blue"},
        r: {color: "red"},
        b: {}
      },
    ],
    buttons: [
      { id: 94, mode: "toggle", color: "green", variant: "play"},
      { id: 93, mode: "toggle", color: "red", variant: "pause"},
      { id: 95, mode: "toggle", color: "red", variant: "record"},
      { id: 91, mode: "latch", variant: "rewind"},
      { id: 92, mode: "latch", variant: "fast forward"},
      { id: 46, mode: "follow", variant: "skip backward"},
      { id: 47, mode: "follow", variant: "skip forward"},
      { id: 96, mode: "follow", variant: "up"},
      { id: 97, mode: "follow", variant: "down"},
      { id: 98, mode: "follow", variant: "left"},
      { id: 99, mode: "follow", variant: "right"},
    ],
  });

  createEffect(() => {
    if (controller.buttons[3].active) setController("buttons", 4, "active", false);
  });
  createEffect(() => {
    if (controller.buttons[4].active) setController("buttons", 3, "active", false);
  });
  createEffect(() => {
    if (controller.buttons[1].active) {
      setController("buttons", 3, "active", false);
      setController("buttons", 4, "active", false);
    }
  });

  const handleActions = (actions?: Action[], value?: boolean | number) => {
    // Do the actions here: update local action values and emit remote actions
    // console.log("actions", actions, value);
    actions?.forEach((action) => {
      switch (action.name) {
        case "local":
          // Set local controller channel
          break;

        case "emit":
          props.onData?.(action.name, action.target, value, action.value);
          break;

        case "current":
          // Store current target
          // if (action.value)
            // props.onData?.(action.name, action.target, action.value);
          break;

        case "setEffect":
          // Store/remove effect
          break;

        case "toggleEffect":
          // Toggle effect
          break;
      }
    })
  };

  onMount(() => {
    const { buttonGroups, buttons, sliders } = controller;
    for (let idx = 0; idx < buttonGroups.length; ++idx) {
      createEffect(
        on(
          () => buttonGroups[idx].m.active,
          (a) => {
            void invoke("trigger_note", { c: (a ? Command.NOTE_ON : Command.NOTE_OFF) + 80 + idx, n: 0, v: 0 });
            handleActions(buttonGroups[idx].m.actions, a);
          },
          { defer: true },
        ),
      );
      createEffect(
        on(
          () => buttonGroups[idx].s.active,
          (a) => {
            void invoke("trigger_note", { c: Command.NOTE_ON, n: 8 + idx, v: a ? 127 : 0 });
            handleActions(buttonGroups[idx].s.actions, a);
          },
          { defer: true },
        ),
      );
      createEffect(
        on(
          () => buttonGroups[idx].r.active,
          (a) => {
            void invoke("trigger_note", { c: Command.NOTE_ON, n: idx, v: a ? 127 : 0 });
            handleActions(buttonGroups[idx].r.actions, a);
          },
          { defer: true },
        ),
      );
      createEffect(
        on(
          () => buttonGroups[idx].b.active,
          (a) => {
            void invoke("trigger_note", { c: Command.NOTE_ON, n: 24 + idx, v: a ? 127 : 0 })
            handleActions(buttonGroups[idx].b.actions, a);
          },
          { defer: true },
        ),
      );
    };

    for (let idx = 0; idx < buttons.length; ++idx) {
      createEffect(
        on(
          () => buttons[idx].active,
          (a) => {
            void invoke("trigger_note", { c: Command.NOTE_ON, n: buttons[idx].id, v: a ? 127 : 0 })
            handleActions(buttons[idx].actions, a);
          },
          { defer: true },
        ),
      );
    };

    for (let idx = 0; idx < sliders.length; ++idx) {
      createEffect(
        on(
          () => sliders[idx].value,
          (v) => {
            handleActions(sliders[idx].actions, v);
          },
          { defer: true },
        ),
      );
      createEffect(
        on(
          () => sliders[idx].setpoint,
          (setpoint) => {
            const v = setpoint ?? sliders[idx].value;
            // Sets to a new value to enable LED or current slider value to disable it
            void invoke("trigger_note", { c: Command.NOTE_ON + 80 + idx, n: 0, v });
            setController("sliders", idx, "value", v);
          },
          { defer: true },
        ),
      );
    };
  });

  onMount(async () => {
    console.log("async load");
    await updateDevices();

    await listen("midi-device-disconnected", updateDevices);
    await listen("midi-device-connected", updateDevices);
  });

  onCleanup(() => {
    unlisten?.();
  })

  createEffect(
    on([connection, () => devices.inputs, () => devices.outputs],
    async ([currentConnection, currentInputs, currentOutputs], old) => {      
      // Cleanup listener if we don't want a connection or when it's lost
      if (unlisten && (!currentConnection || currentConnection && !Object.values(currentInputs).includes(currentConnection))) {
        console.log("disconnect");
        await invoke("disconnect_midi_input");
        await invoke("disconnect_midi_output");

        unlisten();
      }

      // Create new one if we didn't have one or it has been restored
      if (currentConnection && Object.values(currentInputs).includes(currentConnection) && (!old?.[0] || !Object.values(old?.[1]).includes(currentConnection))) {
        const portIndex = Number(Object.entries(currentInputs).find(ci => ci[1] === currentConnection)?.[0]);
        const portOutdex = Number(Object.entries(currentOutputs).find(ci => ci[1] === currentConnection)?.[0]);
        console.log("connect", currentConnection, portIndex);

        await invoke("connect_midi_input", { portIndex });
        await invoke("connect_midi_output", { portIndex: portOutdex });
        unlisten = await listen<MidiMessage>("midi-input", ({ payload }) => {
          // Right mode
          // rotary: (l-r) command b0, note: 30-37 velocity: 0-127
          // channel buttons command b0, t-b: 20, 28 ,36, 44 to right = +1, velocity 127=on, 0=off
          // Ex: slider value, command b0, note: 40-47, velocity:0-127
          // bottom buttons: command b0, notes (l-r) 52-62, velocity 127=on, 0=off

          switch (payload.message[0] & 0xf0) {
            case Command.CONTINUOUS: // Rotary button or all buttons in right side mode
            {
              // 30-37: rotary velocity
              const { step, index } = getRotaryStepIndex(payload.message[1], payload.message[2]);
              // TODO: check if we need to return other attributes as well
              setController("rotaries", index, (old) => {
                if (old.value + step < 0) {
                  return { value: old.mode === "wrap" ? old.value + step + 1 : 0 };
                } else if (old.value + step > 1) {
                  return { value: old.mode === "wrap" ? old.value + step - 1 : 1 };
                }
                return { value: old.value + step };
              });
              console.log(index, step);
              break;
            }

            case Command.PITCH:
              const index = payload.message[0] & 0x0f;
              setController("sliders", index, "value", payload.message[2] / 127);
              break;

            case Command.NOTE_ON:
            {
              // Typically: velocity = 127
              const idx = controller.buttons.findIndex(b => b.id === payload.message[1]);
              if (idx !== -1) {
                setController("buttons", idx, "active", controller.buttons[idx].mode === "toggle" ? !controller.buttons[idx].active : true);
              } else {
                const { channel, button } = getButtonGroupIndex(payload.message[1]);
                const bg = controller.buttonGroups[channel][button];
                setController("buttonGroups", channel, button, "active", bg.mode === "toggle" ? !bg.active : true);
              }
              break;
            }

            case Command.NOTE_OFF:
            {
              const idx = controller.buttons.findIndex(b => b.id === payload.message[1]);
              if (idx !== -1) {
                if (!controller.buttons[idx].mode || !["latch", "toggle"].includes(controller.buttons[idx].mode))
                  setController("buttons", idx, "active", false);
              } else {
                const { channel, button } = getButtonGroupIndex(payload.message[1]);
                const bg = controller.buttonGroups[channel][button];
                if (!bg.mode || !["latch", "toggle"].includes(bg.mode))
                  setController("buttonGroups", channel, button, "active", false);
              }
              // Typically: velocity = 0
              break;
            }
          }

          // console.log(
          //   "MIDI:",
          //   payload.timestamp,
          //   "command",
          //   payload.message[0].toString(16),
          //   "note",
          //   payload.message[1],
          //   "velocity",
          //   payload.message[2],
          // );
        });

      }
  }));

  const updateDevices = async () => {
    const availableDevices = await invoke<MidiConnections>("list_midi_connections");
    setDevices(availableDevices);
  }

  return <>
    <div>
      <div>
        Connection:
        <select onchange={(e) => setConnection(e.target.value)}>
          <option value="">None</option>
          <For each={Object.keys(devices.inputs)}>{(c) =>
            <option selected={devices.inputs[c] === connection()} value={devices.inputs[c]}>{devices.inputs[c]}</option>
          }</For>
          <Show when={connection() && !Object.values(devices.inputs).includes(connection()!)}>
            <option selected disabled value={connection()}>{connection()} (unavailable)</option>
          </Show>
        </select>
      </div>
      <div style={{"background-color": "#eee", padding: "16px", "border-radius": "16px"}}>
        <div>
          <For each={controller.sliders}>{(slider, i) =>
            <ControllerChannel
              slider={slider.value}
              m={controller.buttonGroups[i()].m.active}
              s={controller.buttonGroups[i()].s.active}
              r={controller.buttonGroups[i()].r.active}
              b={controller.buttonGroups[i()].b.active}
            />
          }</For>
        </div>
        <div>
          <For each={controller.buttons}>{(button) =>
            <ControllerButton {...button} />
          }</For>
        </div>
      </div>
    </div>
  </>
}

export default Remote;
