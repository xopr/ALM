import { Component } from "solid-js";

import styles from "./Light.module.css";
import LabeledInput from "../LabeledInput";

type ChannelsPerLed = 1 | 3 | 4 | 5;

/** Light segment */
export type SegmentProps = {
  /** IP address or hostname of the Art-Net node */
  address: string,
  /** Port number of the Art-Net node */
  port: number,
  /** Target DMX universe for this segment */
  universe: number,
  /** offset within Art-Net packet */
  channelStart: number,
  /** Channels per LED (typically 3) */
  channelsPerLed: ChannelsPerLed,
  /** Amount of horizontal LEDs within the light segment, for example: LED sleeve is 7 */
  width: number;
  /** Amount of vertical LEDs within the light segment, for example: LED sleeve is 21 */
  height: number;
  /** Amount of LEDs to skip within effect (bezel/padding) */
  ledOffset: number,
}

export const Segment: Component<SegmentProps> = (props) => {

  return <div class={styles.segment} data-draggable="true" data-type="segment">
    Segment node
    <LabeledInput label="Address" value={props.address} onInput={(e) => props.address = e.currentTarget.value}/>
    <LabeledInput label="Port" value={props.port} type="number" min={1} max={65535} onInput={(e) => props.port = parseInt(e.currentTarget.value)}/>
    <LabeledInput label="Universe" value={props.universe} type="number" min={0} max={65535} onInput={(e) => props.universe = parseInt(e.currentTarget.value)}/>
    <LabeledInput label="Channel start" value={props.channelStart} type="number" min={0} max={65535} onInput={(e) => props.channelStart = parseInt(e.currentTarget.value)}/>
    <LabeledInput label="Channels per LED" value={props.channelsPerLed} type="number" min={1} max={5} onInput={(e) => props.channelsPerLed = parseInt(e.currentTarget.value) as ChannelsPerLed}/>
    <LabeledInput label="LED width" value={props.width} type="number" min={1} max={512} onInput={(e) => props.width = parseInt(e.currentTarget.value)}/>
    <LabeledInput label="LED height" value={props.width} type="number" min={1} max={512} onInput={(e) => props.height = parseInt(e.currentTarget.value)}/>
    <LabeledInput label="LED offset" value={props.ledOffset} type="number" min={0} max={511} onInput={(e) => props.ledOffset = parseInt(e.currentTarget.value)}/>
  </div>
};

export default Segment;
