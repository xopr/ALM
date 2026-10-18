import { Component } from "solid-js";

import styles from "./Controller.module.css";

type Props = {
  slider?: number
  led?: boolean;
  m?: boolean;
  s?: boolean;
  r?: boolean;
  b?: boolean;
  onClick?: (type: string) => void;
}

export const ControllerChannel: Component<Props> = (props) => {
  "";
  return <div class={styles.channel}>
    <div onClick={() => props.onClick?.("rotaries")} class={styles.rotary}></div>
    <div class={`${styles.led} ${styles.white} ${props.led ? styles.on : ""}`}></div>
    <div onClick={() => props.onClick?.("sliders")}class={styles.slider}>
      <div style={{top: `${(1 - (props.slider ?? 0)) * 100}%`}} />
    </div>
    <div class={styles.buttons}>
      <div onClick={() => props.onClick?.("m")} class={`${styles.orange} ${props.m ? styles.on : ""}`}>M</div>
      <div onClick={() => props.onClick?.("s")} class={`${styles.blue} ${props.s ? styles.on : ""}`}>S</div>
      <div onClick={() => props.onClick?.("r")} class={`${styles.red} ${props.r ? styles.on : ""}`}>R</div>
      <div onClick={() => props.onClick?.("b")} class={`${styles.white} ${props.b ? styles.on : ""}`}>&#9723;</div>
    </div>
  </div>
}