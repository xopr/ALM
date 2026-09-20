import { Component, Match, Switch } from "solid-js";

import styles from "./Controller.module.css";

type Props = {
  variant: "play" | "pause" | "record" | "rewind" | "fast forward" | "skip backward" | "skip forward" | "up" | "down" | "left" | "right";
  color?: "white" | "red" | "orange" | "green" | "blue";
  active?: boolean;
}

export const ControllerButton: Component<Props> = (props) => {
  return <div class={`${styles.button} ${styles[props.color ?? "white"]} ${props.active ? styles.on : ""}`}>
    <Switch>
      <Match when={props.variant === "play"}>&#9654;</Match>
      <Match when={props.variant === "pause"}>&#8545;</Match>
      <Match when={props.variant === "record"}>&#x25CF;</Match>
      <Match when={props.variant === "rewind"}>&#9666;&#9666;</Match>
      <Match when={props.variant === "fast forward"}>&#9656;&#9656;</Match>
      <Match when={props.variant === "skip backward"}>&#171;</Match>
      <Match when={props.variant === "skip forward"}>&#187;</Match>
      <Match when={props.variant === "up"}>&#9651;</Match>
      <Match when={props.variant === "down"}>&#9661;</Match>
      <Match when={props.variant === "left"}>&#9665;</Match>
      <Match when={props.variant === "right"}>&#9655;</Match>
    </Switch>
  </div>
}