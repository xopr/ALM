* DataObject cannot be cloned bug -> running in background issue?

* connect control to selected sleeve instance(s)
* tauri directory scanner -> ["/effects/MyEffectTemplate.ts"]
* attach buttons
  * LightGroup add
  * LightGroup delete
  * (Effect on/off)
  * Effect remove
  * (drag delete)
  * Edit light name
  * Add light
  * Delete light
  * Add segment
  * Delete segment
* Preview tab
* Map tab
* Midi remote tab
  * (connect)
* pointer events
  * verify dragdrop pointer id (against multi touch)
  * dragover: set highlight style (light reordering) (drag in between items)
  * emulate click instead of relying on native click
  * drag on offsettop/bottom->scroll
  * custom dragnode
  * implement DragLeave (remove highlight in rare cases)
* segment settings:
  * allow for array in treeList
  * warn if: channelStart/ledCount not LED-aligned, overlap w/ other segment
  * channelsPerLed: enum? "RGB" "BRG" -> fix device-side?
* Effect
  * add Color channels? 1:L, 3:RGB, 4:RGBW, 5:RGBWW
  * effect instance control -> option to follow parent


* create worker threads for effect: post data for artnet

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
