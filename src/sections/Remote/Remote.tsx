import { invoke } from "@tauri-apps/api/core";
import { Component, createEffect, createSignal, For, on, onCleanup, onMount, Show } from "solid-js";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { createStore } from "solid-js/store";
import { ControllerChannel } from "../../components/Controller/ControllerChannel";
import { ControllerButton } from "../../components/Controller/ControllerButton";
import { ChannelValues } from "../../../public/Effect";
import { ControllerBinding } from "../../components/Controller/ControllerBinding";
import { Action, Button, ButtonGroup, Command, Controller, InternalAction, Local, MidiConnections, MidiMessage, Slider } from "./types";

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
    case 1:
      return { step: 0.003, index: note - 16 };
    case 65:
      return { step: -0.003, index: note - 16 };
    default:
      // NOTE: Apparently, this suddenly doesn't work anymore.
      return { step: 33 - note, index: velocity > 1 ? -0.02 : 0.02 };
  }
}

type Props = {
  /** Full channel data for selected item */
  channels?: ChannelValues;
  /** Effect active */
  enabledEffect?: boolean;
  /** Data event handler */
  onData?: <T extends Action = Action>(name: T["name"], target: T["target"], value: T["value"], index?: number) => void;
}

export const Remote: Component<Props> = (props) => {
  const [devices, setDevices] = createStore<MidiConnections>({ inputs: {}, outputs: {} });
  const [controller, setController] = createStore<Controller>({
    rotaries: [
      { value: 0, mode: "wrap", actions: [{name: "emit", target: "0_0", value: 0}] },
      { value: 0, mode: "wrap", actions: [{name: "emit", target: "0_0_0", value: 0}] },
      { value: 0, mode: "wrap", actions: [{name: "emit", target: "0_0_1_0", value: 0}] },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
    ],
    leds:[false,false,false,false,false,false,false,false],
    sliders: [
      { value: 0, actions: [{name: "emit", target: "selected", value: 0}] },
      { value: 0, actions: [{name: "emit", target: "selected", value: 1}] },
      { value: 0, actions: [{name: "emit", target: "selected", value: 2}] },
      { value: 0, actions: [{name: "emit", target: "selected", value: 3}] },
      { value: 0, actions: [{name: "emit", target: "selected", value: 4}] },
      { value: 0, actions: [{name: "emit", target: "selected", value: 5}] },
      { value: 0, actions: [{name: "emit", target: "selected", value: 6}] },
      { value: 0, actions: [{name: "emit", target: "selected", value: 7}] },
    ],
    buttonGroups: [
      {
        m: {color: "orange", mode: "toggle", actions: [{name: "toggleEffect", target: "0_0"}]},
        s: {color: "blue", actions: [{name: "setEffect", target: "0_0", value: "Fire"}]},
        r: {color: "red", actions: [{name: "setEffect", target: "0_0"}]},
        b: {}
      },
      {
        m: {color: "orange", actions: [{name: "local", target: "sliders_0", value: 0.5}]},
        s: {color: "blue", actions: [{name: "local", target: "buttons_0", value: undefined}]},
        r: {color: "red", actions: [{name: "local", target: "buttons_1", value: true}]},
        b: {actions: [{name: "local", target: "buttonGroups_7_b", value: undefined}]},
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
        b: {actions: [{name: "selected", target: "0_0"}]}
      },
    ],
    buttons: [
      { id: 94, mode: "toggle", color: "green", variant: "play"},
      { id: 93, mode: "toggle", color: "red", variant: "pause"},
      { id: 95, mode: "toggle", color: "red", variant: "record"},
      { id: 91, mode: "follow", variant: "rewind"},
      { id: 92, mode: "follow", variant: "fast forward", actions: [{name: "setEffect", target: "0_0", value: "HSL"}]},
      // Note: starting from here, there is no button feedback: toggle and latch will not be visible
      { id: 46, mode: "follow", variant: "skip backward", actions: [{name: "setEffect", target: "0_0", value: "Roll"}]},
      { id: 47, mode: "follow", variant: "skip forward", actions: [{name: "setEffect", target: "0_0", value: "Shift"}]},
      { id: 96, mode: "follow", variant: "up", actions: [{name: "setEffect", target: "0_0", value: "Fire"}]},
      { id: 97, mode: "follow", variant: "down", actions: [{name: "setEffect", target: "0_0", value: "Barber"}]},
      { id: 98, mode: "follow", variant: "left", actions: [{name: "setEffect", target: "0_0", value: "Matrix"}]},
      { id: 99, mode: "follow", variant: "right", actions: [{name: "setEffect", target: "0_0", value: "Plasma"}]},
    ],
  });

  const handleActions = (actions?: InternalAction[], value?: boolean | number, mode?: "toggle" | "follow" | "latch") => {
    // Do the actions here: update local action values and emit remote actions
    actions?.forEach((action) => {
      switch (action.name) {
        case "selected":
          // Store current target: only trigger when value is true
          if (value)
            props.onData?.(action.name, action.target, undefined);
          break;

        case "emit":
          // Emit value; replace "true" with 1
          props.onData?.(action.name, action.target, value, action.value === true ? 1 : action.value as number);
          break;

        case "local":
        {
          // Set local controller channel (may cascade)
          const [group, index, buttonGroup] = (action.target as Local).split("_") as ["sliders" | "buttons" | "buttonGroups" | "rotaries", string, ButtonGroup | undefined];
          // Translate value to boolean
          let state = !!action.value;
          if (action.value === undefined)
            // Follow
            state = !!value;
          else if (action.value === -1)
            // Invert
            state = !value;

          switch (group) {
            case "buttons":
              setController("buttons", Number(index), "active", state);
              break;
            case "buttonGroups":
              setController(group, Number(index), buttonGroup!, "active", state);
              break;

            // @ts-ignore -- Fall through
            case "sliders":
              setController(group, Number(index), "setpoint", Number(action.value));
            default:
              setController(group, Number(index), "value", Number(action.value));
              break;
          }
          break;
        }

        case "setEffect":
          // Store/remove effect: only clear when it is a toggle button
          if (mode === "toggle" || value)
            props.onData?.(action.name, action.target, value ? action.value : undefined);
          break;

        case "toggleEffect":
          // Toggle effect: by default, set boolean from action value
          let state: boolean = !!action.value;
          if (action.value === undefined)
            // Follow
            state = !!value;
          else if (action.value === -1)
            // Invert
            state = !value;

          props.onData?.(action.name, action.target, state);
          break;
      }
    })
  };

  onMount(() => {
    const { buttonGroups, buttons, sliders, rotaries } = controller;
    for (let idx = 0; idx < buttonGroups.length; ++idx) {
      createEffect(
        on(
          () => buttonGroups[idx].m.active,
          (a) => {
            void invoke("trigger_note", { c: Command.NOTE_ON, n: 16 + idx, v: a ? 127 : 0 })
            handleActions(buttonGroups[idx].m.actions, a, buttonGroups[idx].m.mode);
          },
          { defer: true },
        ),
      );
      createEffect(
        on(
          () => buttonGroups[idx].s.active,
          (a) => {
            void invoke("trigger_note", { c: Command.NOTE_ON, n: 8 + idx, v: a ? 127 : 0 });
            handleActions(buttonGroups[idx].s.actions, a, buttonGroups[idx].s.mode);
          },
          { defer: true },
        ),
      );
      createEffect(
        on(
          () => buttonGroups[idx].r.active,
          (a) => {
            void invoke("trigger_note", { c: Command.NOTE_ON, n: idx, v: a ? 127 : 0 });
            handleActions(buttonGroups[idx].r.actions, a, buttonGroups[idx].r.mode);
          },
          { defer: true },
        ),
      );
      createEffect(
        on(
          () => buttonGroups[idx].b.active,
          (a) => {
            void invoke("trigger_note", { c: Command.NOTE_ON, n: 24 + idx, v: a ? 127 : 0 })
            handleActions(buttonGroups[idx].b.actions, a, buttonGroups[idx].b.mode);
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
            handleActions(buttons[idx].actions, a, buttons[idx].mode);
          },
          { defer: true },
        ),
      );
    };

    for (let idx = 0; idx < rotaries.length; ++idx) {
      createEffect(
        on(
          () => rotaries[idx].value,
          (v) => {
            handleActions(rotaries[idx].actions, v);
          },
          { defer: true },
        ),
      );
      createEffect(
        on(
          () => sliders[idx].value,
          (value) => {
            handleActions(sliders[idx].actions, value);
            // Check value against setpoint: restore light and clear setpoint
            if (sliders[idx].setpoint !== undefined && Math.abs(value - sliders[idx].setpoint!) < 0.01) {
              setController("sliders", idx, "setpoint", undefined);
            }
          },
          { defer: true },
        ),
      );
      createEffect(
        on(
          () => sliders[idx].setpoint, // We're differentiating from value or the system overloads
          (setpoint) => {
            setController("leds", idx, setpoint !== undefined);
            if (setpoint) {
              // Sets to a new value to enable LED or current slider value to disable it
              const v = setpoint * 127 | 0;
              void invoke("trigger_note", { c: Command.NOTE_ON + 80 + idx, n: 0, v });
            }
          },
          { defer: true },
        ),
      );
    };
  });

  onMount(async () => {
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
        console.info("disconnect");
        await invoke("disconnect_midi_input");
        await invoke("disconnect_midi_output");

        unlisten();
      }

      // Create new one if we didn't have one or it has been restored
      if (currentConnection && Object.values(currentInputs).includes(currentConnection) && (!old?.[0] || !Object.values(old?.[1]).includes(currentConnection))) {
        const portIndex = Number(Object.entries(currentInputs).find(ci => ci[1] === currentConnection)?.[0]);
        const portOutdex = Number(Object.entries(currentOutputs).find(ci => ci[1] === currentConnection)?.[0]);
        console.info("connect", currentConnection, portIndex);

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
              setController("rotaries", index, (old) => {
                // Handle wraparound
                if (old.value + step < 0) {
                  return { value: old.mode === "wrap" ? old.value + step + 1 : 0 };
                } else if (old.value + step > 1) {
                  return { value: old.mode === "wrap" ? old.value + step - 1 : 1 };
                }
                return { value: old.value + step };
              });
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
        });
      }
  }));

  createEffect(
    on(
      () => props.channels,
      () => {
        props.channels?.forEach((channel, idx) => {
          // Check current slider and see if it contains "emit" "selected" action
          if (controller.sliders[idx].actions?.some(a => a.name === "emit" && a.target === "selected")) {
            // Only set/update value if the difference is large
            if (Math.abs(channel.value - controller.sliders[idx].value) >= 0.01) {
              setController("sliders", idx, "setpoint", channel.value);
            }
          }
        });
      },
    )
  );
  createEffect(
    on(
      () => props.enabledEffect,
      (active) => {
        // Assume one button tied to current active state
        const m = controller.buttonGroups.findIndex(g => g.m.actions?.some(a => a.name === "emit" && a.target === "selected"));
        const s = controller.buttonGroups.findIndex(g => g.s.actions?.some(a => a.name === "emit" && a.target === "selected"));
        const r = controller.buttonGroups.findIndex(g => g.r.actions?.some(a => a.name === "emit" && a.target === "selected"));
        const b = controller.buttonGroups.findIndex(g => g.b.actions?.some(a => a.name === "emit" && a.target === "selected"));
        const o = controller.buttons.findIndex(g => g.actions?.some(a => a.name === "emit" && a.target === "selected"));
        if (m !== -1) setController("buttonGroups", m, "m", "active", active);
        if (s !== -1) setController("buttonGroups", s, "s", "active", active);
        if (r !== -1) setController("buttonGroups", r, "r", "active", active);
        if (b !== -1) setController("buttonGroups", b, "b", "active", active);
        if (o !== -1) setController("buttons", o, "active", active);
      },
    )
  );

  const updateDevices = async () => {
    const availableDevices = await invoke<MidiConnections>("list_midi_connections");
    setDevices(availableDevices);
  }

  const [activeSetting, setActiveSetting] = createSignal<(Button| Slider) & {
    path: Array< string | number>;
  }>();

  const onClick = (type: string, index: number) => {
    // if not slider, rotary or buttons, its buttonGroups
    const path = [type, index];
    if (!["sliders", "rotaries", "buttons"].includes(type)) {
      // path.unshift(path.pop());
      path.push(path.shift()!);
      path.unshift("buttonGroups");
    }

    console.log(path);

    const input = path.reduce<any>((obj, key) => obj[key], controller) as Button| Slider;

    // path (value/active)
    // mode: follow/toggle/latch(Button), regular/wrap(rotaries)
    // actions: selected(target), emit(target, value?), local(target, value), setEffect(target, value), toggleEffect(target, value)
    // 
    setActiveSetting({
      path,
      mode: "mode" in input ? input.mode : undefined,
      actions: input.actions,
    });
  }
  return <>
    <div>
      <dialog style={{"z-index": 10}} open={!!activeSetting()}>
        <ControllerBinding {...activeSetting()} onClose={() => {
          setActiveSetting();
        }}/>
      </dialog>
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
              slider={slider.setpoint ?? slider.value}
              led={controller.leds[i()]}
              m={controller.buttonGroups[i()].m.active}
              s={controller.buttonGroups[i()].s.active}
              r={controller.buttonGroups[i()].r.active}
              b={controller.buttonGroups[i()].b.active}
              onClick={(type) => onClick(type, i())}
            />
          }</For>
        </div>
        <div>
          <For each={controller.buttons}>{(button, idx) =>
            <ControllerButton {...button} onClick={() => onClick("buttons", idx())} />
          }</For>
        </div>
      </div>
    </div>
  </>
}

export default Remote;
