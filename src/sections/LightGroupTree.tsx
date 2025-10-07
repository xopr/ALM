import { batch, Component } from "solid-js";
import TreeList, { TreeListProps } from "../components/treelist/TreeList";
import { createMutable } from "solid-js/store";
import { clearTreeSelection, treeItemFromArray } from "../components/treelist/treeListHelpers";


export const LightGroupTree: Component = () => {
  // Groups of light(-segment)s to attach an effect to.
  const lightGroups = createMutable<TreeListProps>({
    children: [
      {
        name: "Boshovenpop",
        children: [
          {
            name: "Camping",
            children: [
              { name: "Sleeve1 - 1" },
            ],
          },
          {
            name: "Tent",
            children: [
              { name: "Sleeve2 (1)"},
              { name: "Flut (1)"},
            ],
          },
          {
            name: "Terrace",
            children: [
              {
                name: "Parasol",
                children: [
                  { name: "Parasol (1)"},
                  { name: "Parasol (2)"},
                  { name: "Parasol (3)"},
                ],
              },
              { name: "Sleeve3 (1)"},
            ],
          },
          {
            name: "Display",
            children: [
              { name: "Display (1)(2)(3)" },
            ],
          },
        ],
      },
    ]
  });

  const treelistClick = (indexes?: number[], ctrl?: boolean) => {
    const clickedChild = treeItemFromArray(lightGroups, indexes);
    if (!clickedChild) return;

    if (ctrl)
    {
      clickedChild.selected = !clickedChild.selected;
    } else {
      batch(() => {
        clearTreeSelection(lightGroups);
        clickedChild.selected = true;
      });
    }
  }

  return <TreeList horizontalScroll children={lightGroups.children} onClick={treelistClick}/>
;
}