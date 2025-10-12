import { Component, createSignal, For } from "solid-js";
import sectionStyles from "../sections/Section.module.css";
import { createMutable } from "solid-js/store";
import TreeList, { TreeListProps } from "../components/treelist/TreeList";
import { treeClickHelper } from "../components/treelist/treeListHelpers";
import { TreeItemProps } from "../components/treelist/TreeItem";
/** Light segment */
type Segment = {
  /** IP address or hostname of the Art-Net node */
  address: string,
  /** Port number of the Art-Net node */
  port: number,
  /** Target DMX universe for this segment */
  universe: number,
  /** offset within Art-Net packet */
  channelStart: number,   // TODO: warn if: not LED-aligned, overlap w/ other segment
  /** Channels per LED (typically 3) */
  channelsPerLed: 1 | 3 | 4, // TODO: use type: "RGB"?
  /** Amount of LEDs within the light segment, for example: LED sleeve is 7*21 */
  ledCount: number,     // TODO: warn if: overlap w/ other segment, out of bounds
  /** Amount of LEDs to skip within effect (bezel/padding) */
  ledOffset: number,
}
// List of lights with their segments to direct Art-net data
const lights = createMutable<TreeListProps<Segment[]>>({
  children: [
    {
      name: "Torch",
      type: "light",
      data: [
        {
          address: "127.0.0.1",
          port: 7000,
          universe: 1,
          channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
          channelsPerLed: 3, // type: "RGB"
          ledCount: 147,     // 7 * 21, warn if: overlap w/ other segment, out of bounds
          ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
        }
      ]
    },
    {
      name: "Parasol",
      type: "light",
      data: [
        {
          address: "127.0.0.1",
          port: 7000,
          universe: 1,
          channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
          channelsPerLed: 3, // type: "RGB"
          ledCount: 80,      // 2 parallel spokes of 80 LEDs
          ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
        },
        {
          address: "127.0.0.1",
          port: 7000,
          universe: 1,
          channelStart: 240, // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
          channelsPerLed: 3, // type: "RGB"
          ledCount: 80,      // 2 parallel spokes of 80 LEDs
          ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
        },
        {
          address: "127.0.0.1",
          port: 7000,
          universe: 2,
          channelStart: 0,   // offset within Art-Net packet, warn if: not LED-aligned, overlap w/ other segment
          channelsPerLed: 3, // type: "RGB"
          ledCount: 80,      // 2 parallel spokes of 80 LEDs
          ledOffset: 0,      // amount of LEDs to skip within effect (bezel/padding)
        }
      ]
    }
  ]
});

export const Lights: Component = () => {
  const [light, setLight] = createSignal<TreeItemProps<Segment[]>>();
  const onClick = (selected: TreeItemProps<Segment[]>) => {
    setLight(selected);
    // selected.data[0].address
    // console.log(selected.data)

  };
  
  return <>
        <h1>Lights section [{light()?.name}]</h1>
        <div class={sectionStyles.container}>
          <div class={`${sectionStyles.container} ${sectionStyles.vertical}`}>
            List the sections so we can drag them into the groups.<br/>
            Also list the effects that are currently tied to it?<br/>
            <ul>
              <For each={light()?.data}>{(segment) =>
                <div>
                  Address: {segment.address}<br/>
                  Port: {segment.port}<br/>
                  Universe: {segment.universe}<br/>
                  Channel start: {segment.channelStart}<br/>
                  Channels per LED: {segment.channelsPerLed}<br/>
                  LED count: {segment.ledCount}<br/>
                  LED offset: {segment.ledOffset}<br/>
                </div>
              }</For>
            </ul>
          </div>
          <div class={`${sectionStyles.container} ${sectionStyles.vertical}`} style={{flex: "0 0 20vw"}}>
            <TreeList
              children={lights.children}
              onClick={treeClickHelper(lights, onClick)}
            />
          </div>
        </div>

      </>;
}

export default Lights;
