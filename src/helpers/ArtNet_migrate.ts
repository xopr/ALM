import { listen, UnlistenFn } from "@tauri-apps/api/event";
// import { sleep } from "./async";
import { type AddressList, type AddressListUnsanitized, getAddr } from "../../public/migrationFunctions";
import { bind, Payload, send, unbind } from "@kuyoonjo/tauri-plugin-udp";
import { Strip } from "../../public/Strip";

/**
 * The Artnet class provides operation for sending and receiving data
 * using the Artnet protocol.
 */
export class Artnet
{
    localHost = "0.0.0.0";
    localPort = 6454;
    sock = 0;
    fade = 1.0;
    length = 170;

    addr: AddressList;
    id = "unique_id";
    cleanupListener: UnlistenFn | undefined; 


    //                           01234567   8   9   a   b   c   d   e   f   10  11
    //                                 op-code protver seq phy universe len
    // dataHeader = bytearray( b"Art-Net\x00\x00\x50\x00\x0e\x00\x00\x00\x00\x02\x00" )                    uni   uni
    dataHeader = new Uint8Array([65, 114, 116, 45, 78, 101, 116, 0x00, 0x00, 0x50, 0x00, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00]);
    //                   01234567   8   9   a   b   c   d
    //                              op-code protver
    // pollMsg = bytearray( b"Art-Net\x00\x00\x20\x00\x0e\x00\xff" )
    pollMsg = new Uint8Array([65, 114, 116, 45, 78, 101, 116, 0x00, 0x00, 0x20, 0x00, 0x0e, 0x00, 0xff]);

    /**
     * 
     * @param {*} addr 
     */
    constructor(addr?: AddressListUnsanitized)
    {
        this.addr = getAddr(addr);

        // TODO: fade
        // if ("FADE" in process.env)
        // {
        //     this.fade = parseFloat(process.env.FADE);
        //     if (this.fade > 1.0)
        //       this.fade = 1.0;
        //     if (this.fade < 0.0)
        //       this.fade = 0.0;
        // }

        // TODO: host (listen address)
        // Check if host= argument given or HOST env. variable set
        // if (process.argv.length > 1)
        // {
        //     process.argv.forEach((arg) => {
        //         if (arg.startsWith("host="))
        //             this.localHost = arg.substring(5);
        //     })
        // }
        // else if ("HOST" in process.env)
        // {
        //     this.localHost = process.env.HOST;
        // }

        // TODO: listen port
        // Check if port= argument given or PORT env. variable set
        // if (process.argv.length > 1)
        // {
        //     process.argv.forEach((arg) => {
        //         if (arg.startsWith("port="))
        //             this.localPort = arg.substring(5);
        //     })

        // }
        // else if ("PORT" in process.env)
        // {
        //     this.localPort = process.env.PORT;
        // }

        // Create UDP socket
        // this.sock = createSocket('udp4');
        // this.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        // this.sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        // this.sock.bind(this.localPort, this.localHost);
        // listen<Payload>("plugin://udp", (x) => console.log(x.payload)).then(unlisten => this.cleanupListener = unlisten);
        // TODO: sync?
        bind(this.id, "0.0.0.0:6454").catch((e) => {
          console.warn("Failed to bind:", e);
        });
    }

    /**
     * Shutdown the connection
     */
    async close()
    {
        this.clear();
        // Timer needed to send the clear packet.
        // await sleep(0);
        // this.sock.close();

        // Clean up socket
        await unbind(this.id);
        this.cleanupListener?.();

    }

    /**
     * Clear the entire strip
     */
    clear()
    {
        const data = new Uint8Array(this.dataHeader.length + 3 * this.length);
        data.set(this.dataHeader);
        for (let i = 0; i < this.length; ++i)
        {
            data.set([0x00, 0x00, 0x00], this.dataHeader.length + 3 * i );
        }

        this.addr.forEach(([addr, port, universe = 0]) => {
            // Set universe
            const d2 = new Uint8Array(data);
            d2.set([universe], 14 );

            // TODO: await loop?
            void send(this.id, `${addr}:${port}`, Array.from(d2)).catch((e) => { console.warn("cannot send", e)});

            // this.sock.send(d2, 0, d2.length, port, addr, (err, _len) => {
            //     if (err)
            //         console.error('error', err);
            // });
        })
    }

    /**
     * Send the data of a strip
     *
     * @param {*} current_strip 
     */
    send(current_strip: Strip)
    {
        console.log("init", this.addr);
      console.log("send data");
      
        const data = new Uint8Array(this.dataHeader.length + 3 * this.length);
        data.set(this.dataHeader);
        for (let i = 0; i < this.length; ++i)
        {
            const c = current_strip.get(current_strip.length - i)
            data.set(c, this.dataHeader.length + 3 * i);
        }

        this.addr.forEach(([addr, port, universe = 0]) => {
            // Set universe
            const d2 = new Uint8Array(data);
            d2.set([universe], 14 );

            // TODO: await loop?
            void send(this.id, `${addr}:${port}`, Array.from(d2)).catch((e) => { console.warn("cannot send", e)});
            // this.sock.send(d2, 0, d2.length, port, addr, (err, _len) => {:
            //     if (err)
            //         console.error('error', err);
            // });
        })
    }

    /**
     * Run poll for 5 seconds.
     */
    poll()
    {
        /*
            devices = []
            this.sock.setblocking(0)
            for _i, address in enumerate(this.addr):
            this.sock.sendto(this.pollMsg, address)
            print( "=== Sent artnet poll ===" )
            const now = Date.now()
            while (Date.now() - now) < 5:
            ready = select.select([this.sock], [], [], 0.5)
            if ready[0]:
                rdata, raddr = this.sock.recvfrom(5000)
                if (rdata[8]) == 0x00 and (rdata[9]) == 0x20:
                print( "received poll request from", raddr[0], "@", raddr[1] )
                # officially this needs to be answered with a reply
                if (rdata[8]) == 0x00 and (rdata[9]) == 0x21:
                print( "received poll reply from", raddr[0], "@", raddr[1] )
                devices.append(raddr)
            this.sock.setblocking(1)
            return devices
        */
        
    }
}
