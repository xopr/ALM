* check error on dropping dummy light effect

* builds steps -> "../public/effects/"

* drag drop Light to Scene tree (group item)
* refresh effect folder

* swap control+lights


* DataObject cannot be cloned bug -> running in background issue?

Better tree:
* lightGroupTree -> data
  * disabled state

* presets / scene selection

* attach buttons
  * Effect on -> trigger postmessage (like change channel) to restart animation
  * (drag delete)
* pointer events
  * drag drop lights/segments
  * verify dragdrop pointer id (against multi touch)
  * dragover: set highlight style (light reordering) (drag in between items)
  * emulate click instead of relying on native click
  * drag on offsettop/bottom->scroll
  * custom dragnode
  * implement DragLeave (remove highlight in rare cases)
* store tree and lights/segments in localStorage/indexedDB?
  * read/import config as an external file
* Midi remote tab
  * (connect)
* segment settings:
  * allow for array in treeList
  * warn if: channelStart/ledCount not LED-aligned, overlap w/ other segment
  * channelsPerLed: enum? "RGB" "BRG" -> fix device-side?
* Effect
  * add Color channels? 1:L, 3:RGB, 4:RGBW, 5:RGBWW
  * effect instance control -> option to follow parent
* Preview tab
* Map tab


* create worker threads for effect: post data for artnet
* tauri directory scanner -> fall back to internal (public) folder
* chain effects (lightning override, etc)

examples
8*64 LED display: 3 universes


light
* ArtNet ip, port, universe, offset, synchronize same universe (default: true; only send when all channels are emitted)
* 1 or more segments: channel range (RGB, start, length)
  * types: cone (spiral,zigzag), 2d (spiral,zigzag/serpentine), 1d
  * >512: multiple universes (hard linked segments?)
  * auto group segments
* sync/group data transfers -> synchronize effect group (only send when all effect instances have run/tick)


effects
1. per segment
2. per logic group -> lock segment channels
3. root level: HSV (off-color)/HSL (off-white)

* input/effect/midi channels
* supported types (and channels)
effect group presets


controls
* midi/UI
* link multiple controls to same channel (hard/soft link -> with/without feedback)
* channels (analog, digital, 2-way) on/off/toggle/pulse, value, up/dn/pgup/pgdn
* highlight light to indicate light segment connections

|  
+-lightgroup
| +-light
| '-light
|   +-segment1 
|   '-segment2
'-lightgroup
  '-light
    +-segment1
    +-segment2
    '-segment3


bind light segment at other group,
or
put effect on segment


lights
  segment(s)

  segments in lightgroup
