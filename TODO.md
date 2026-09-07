* B-M channel values are applied from static instead of parent/originalEffect
* B-M Disable/remove effect does not update Control channel values

* B-L icon click not working
* B-M (inline) icon v-alignment is wrong

* F align effects/lights on left side near tree control (optional?)
* F check if previous frame is available to do crossover to new effect
* T check removeEffect recursion on toggle effect
* B cleanup frame after removing effect
* F add channel name tooltip
* F tooltip tap and hold
* F bigger buttons for touch?

* MB-L separate segment on same IP/universe glitches (not uniform packet)
  -> workaround: 80 skip 190 to trigger next universe ([v] Custom bus start indices)

* B?-L ledOffset is channelOffset -> channelStart??
  -> verify: create/use dedicated effect to measure bezel/padding

* F list the effect(s) that are tied to the Lights section segment
* F add segment drag handle
* B group slider value is equal to last child value
* B-L: changing 3 channels simultaneously for 10 segments introduces some lag
  -> check frame queue and drop intermediate frames / throttle Artnet output

* F? List effect channel preset for current (group) effect
  -> add child slider (snap)tick or button
* F? map channel names on top of each other OR: ignore the other effect tree!

* F: drag drop Light 
* F: refresh effect folder

* B: DataObject cannot be cloned bug: Worker thread?
  -> running in background issue?

* F: presets / scene selection
* F: snap points on slider

* attach buttons
  * drag delete
* pointer events
  * F: drag drop lights/segments to Scene tree (group item)
  * F: dragover: set highlight style (light reordering) (drag in between items)
  * ?: emulate click instead of relying on native click
  * F: drag on offsettop/bottom->scroll
  * F: custom dragnode
  * B: implement DragLeave (remove highlight in rare cases)
* F: export tree and lights/segments in localStorage/indexedDB?
* Midi remote tab
  * (connect)
* segment settings:
  * allow for array in treeList
  * warn if: channelStart/ledCount(w*h) not LED-aligned, overlap w/ other segment
  * channelsPerLed: enum? "RGB" "BRG" -> fix device-side?
* Effect
  * effect instance control -> option to follow or ignore parent
* Preview tab
* Map tab

examples
8*64 LED display: 3 universes


light
* ArtNet ip, port, universe, offset, synchronize same universe (default: true; only send when all channels are emitted)
* 1 or more segments: channel range (RGB, start, length)
  * types: cone (spiral,zigzag), 2d (spiral,zigzag/serpentine), 1d
  * >512: multiple universes (hard linked segments?)
  * auto group segments
* sync/group data transfers -> synchronize effect group (only send when all effect instances have run/tick)



controls
* link multiple controls to same channel (hard/soft link -> with/without feedback)
* channels (analog, digital, 2-way) on/off/toggle/pulse, value, up/dn/pgup/pgdn
* highlight light to indicate light segment connections

* F-L: extra outputs: Bluetooth (spots, display), Tasmota


TESTPLAN
* drop different effect on different layers: slider -> override child mode
