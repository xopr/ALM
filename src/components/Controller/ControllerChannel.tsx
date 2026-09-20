import { Component } from "solid-js";

import styles from "./Controller.module.css";

type Props = {
  slider?: number
  led?: boolean;
  m?: boolean;
  s?: boolean;
  r?: boolean;
  b?: boolean;
}

export const ControllerChannel: Component<Props> = (props) => {
  "";
  return <div class={styles.channel}>
    <div class={styles.rotary}></div>
    <div class={`${styles.led} ${styles.white} ${props.led ? styles.on : ""}`}></div>
    <div class={styles.slider}>
      <div style={{top: `${(1 - (props.slider ?? 0)) * 100}%`}} />
    </div>
    <div class={styles.buttons}>
      <div class={`${styles.orange} ${props.m ? styles.on : ""}`}>M</div>
      <div class={`${styles.blue} ${props.s ? styles.on : ""}`}>S</div>
      <div class={`${styles.red} ${props.r ? styles.on : ""}`}>R</div>
      <div class={`${styles.white} ${props.b ? styles.on : ""}`}>&#9723;</div>
    </div>
  </div>
}