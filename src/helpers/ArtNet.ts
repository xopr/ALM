import { bind, Payload, send, unbind } from "@kuyoonjo/tauri-plugin-udp";

/**
 * The Artnet class provides operation for sending and receiving data
 * using the Artnet protocol.
 */
export class Artnet
{
  id = "unique_id";

  //                           01234567   8   9   a   b   c   d   e   f   10  11
  //                                 op-code protver seq phy universe len
  // dataHeader = bytearray( b"Art-Net\x00\x00\x50\x00\x0e\x00\x00\x00\x00\x02\x00" )                    uni   uni
  dataHeader = new Uint8Array([65, 114, 116, 45, 78, 101, 116, 0x00, 0x00, 0x50, 0x00, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00]);

  constructor()
  {
    // listen<Payload>("plugin://udp", (x) => console.log(x.payload)).then(unlisten => this.cleanupListener = unlisten);
    bind(this.id, "0.0.0.0:6454").catch((e) => {
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
    const data = new Uint8Array(this.dataHeader.length + channelStart + channelsPerLed * ledCount);
    data.set(this.dataHeader);
    data.set(effectData.slice(ledOffset * channelsPerLed), this.dataHeader.length + channelStart);

    // Set universe
    data.set([universe], 14 );

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
