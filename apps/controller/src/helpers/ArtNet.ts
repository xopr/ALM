import { bind, send, unbind } from "@kuyoonjo/tauri-plugin-udp";

/**
 * The Artnet class provides operation for sending and receiving data
 * using the Artnet protocol.
 */
export class Artnet
{
  id = "unique_id";
  private static _instance: Artnet;

  //                            A    r    t   -   N    e    t   [0]  Opcode....  Protocol..  Seq.  Phy.  Universe..  Length....
  dataHeader = new Uint8Array([65, 114, 116, 45, 78, 101, 116, 0x00, 0x00, 0x50, 0x00, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00]);
  // Opcode: ArtDMX (0x5000 little endian)
  // Protocol: hi:0, lo: 14
  // Sequence: 0: disable or 1-255
  // Physical: unused
  // Universe little endian
  // Length: hi: ?, lo: 2-512, even

  constructor()
  {
    // Force singleton
    if (Artnet._instance) {
      return Artnet._instance;
    }
    Artnet._instance = this;
    
    // listen<Payload>("plugin://udp", (x) => console.log(x.payload)).then(unlisten => this.cleanupListener = unlisten);
    bind(this.id, "0.0.0.0:0").catch((e) => {
      console.warn("Failed to bind:", e);
    });
  }
    
  /**
   * Send the data of a strip
   *
   * @param {*} current_strip 
   */
  async send(effectBuffer: ArrayBuffer, address: string, port: number, universe: number, channelStart: number, channelsPerLed: number, ledCount: number, ledOffset = 0)
  {
    const effectData = new Uint8Array(effectBuffer);
    const data = new Uint8Array(this.dataHeader.length + channelStart + channelsPerLed * (ledCount - ledOffset));
    data.set(this.dataHeader);
    data.set(effectData.slice(ledOffset * channelsPerLed), this.dataHeader.length + channelStart);

    const view = new DataView(data.buffer);
    // Set universe
    view.setInt16(14, universe, false);

    // Set length
    // TODO: force even parity directed by spec
    view.setInt16(16, length, false);

    await send(this.id, `${address}:${port}`, Array.from(data)).catch((e) => { console.warn("cannot send", e)});
  }

  /**
   * Shutdown the connection
   */
  async close()
  {
      // this.clear();
      // Timer needed to send the clear packet.
      // await sleep(0);
      // this.sock.close();

      // Clean up socket
      await unbind(this.id);
      // this.cleanupListener?.();

  }

}
