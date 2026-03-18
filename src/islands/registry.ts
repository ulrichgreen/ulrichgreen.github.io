import type { ComponentType } from "preact/compat";
import { DemoWidgetClient } from "./demo-widget.tsx";
import { TableOfContentsClient } from "./table-of-contents.tsx";

export const islandRegistry = {
    DemoWidget: DemoWidgetClient,
    TableOfContents: TableOfContentsClient,
} satisfies Record<string, ComponentType<any>>;

export type IslandName = keyof typeof islandRegistry;
