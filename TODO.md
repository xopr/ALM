* verify (destroy): MB onload/overload(?) does not remove instance -> network is spammed!
  * delete and add also doesn't work (pauses effect)
* verify (destroy): MB multiple layered different effects trigger all instance values!

* verify: MB group effect only transmits last segment on timer (or previously transmitted selected child)

* verify: MB sometimes, dropping effect on group does not encompass all children
  * 0 children means no slider?
  -> needs effect hover or select to "initialize"

* MB separate segment on same IP/universe glitches (not uniform packet)
  -> 80 skip 190 to trigger next universe ([v] Custom bus start indices)

* B ledOffset is channel offset
* B refreshRate is renderDelay
* F list the effect(s) that are tight to the Lights section segment
* F add segment drag handle
* ? List effect channel preset for current (group) effect
* ? map channel names on top of each other OR: ignore the other effect tree!
* group slider value is equal to last child value
* changing 3 channels simultaneously for 10 segments introduces some lag

TESTPLAN
* drop different effect on different layers: slider -> override child mode

-----------------------------

* check error on dropping dummy light effect

* builds steps -> "../public/effects/"

* drag drop Light to Scene tree (group item)
* refresh effect folder


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
  * warn if: channelStart/ledCount(w*h) not LED-aligned, overlap w/ other segment
  * channelsPerLed: enum? "RGB" "BRG" -> fix device-side?
* Effect
  * add Color channels? 1:L, 3:RGB, 4:RGBW, 5:RGBWW
  * effect instance control -> option to follow parent
* Preview tab
* Map tab


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
