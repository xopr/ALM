import { JSX } from "solid-js/jsx-runtime";
import type { IEffect, Effect } from "../../public/Effect";
import type { SegmentProps } from "../components/light/Segment";

/** Base class tree item */
export type TreeItem = {
  /** Type of tree item */
  // type: never;
  /** Visible name / label */
  name?: string;
  /** Whether the item is selected */
  selected?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Outlined style (for drag-drop) */
  outlined?: boolean;
  /** Optional icon */
  icon?: JSX.Element;
  /** Identifier for lookup and navigation */
  id: string;
  /** Item's data to work with */
  data?: unknown;
}

/** Light control data */
export type EffectControlData = {
  /** The effect class bound to this item and descendants */
  effect?: Effect;
  /** The disabled/overridden effect class bound to this item and descendants */
  originalEffect?: Effect; // -> effectDisabled
  /** Base channel values for descendants */
  channelValues?: number[];
}

type SegmentControlData = {
  /** The light segment communication details (TODO) */
  segment: SegmentProps;
  /** The running effect instance */
  effectInstance?: IEffect;
}







/** Light control base class (where everything comes together) */
export type SegmentTreeItem = SegmentTreeGroup | SegmentItem;
/** Light tree item */
export type LightTreeItem = LightTreeGroup | DmxLightItem;

/**
 * Segment group
 *
 * Group that defines a light instance, area or logical separation
*/
export type SegmentTreeGroup = TreeItem & {
  /** Group (parent) tree item */
  type: "group";
  /** Light control data */
  data: EffectControlData;
  /** Children / descendants */
  children: Array<SegmentTreeGroup | SegmentItem>;
}

/** Light segment */
export type SegmentItem = TreeItem & {
  /** Active segment tree item */
  type: "segment";
  /** Light and segment control data */
  data: EffectControlData & SegmentControlData;
}


/////////////////////
// Light connections
/////////////////////
/**
 * Segment group
 *
 * Group that defines a light instance, area or logical separation
*/
export type LightTreeGroup = TreeItem & {
  /** Group (parent) tree item */
  type: "group";
  /** Children / descendants */
  children: Array<LightTreeGroup | DmxLightItem>;
}


/** Light instance */
export type DmxLightItem = TreeItem & {
  type: "dmxLight";
  /** Light data */
  data: SegmentProps[];
}
