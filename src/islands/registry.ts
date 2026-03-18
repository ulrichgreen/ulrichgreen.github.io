import type { ComponentType } from "preact/compat";
import { DemoWidget } from "../components/demo-widget/demo-widget.client.tsx";
import { TableOfContents } from "../components/table-of-contents/table-of-contents.client.tsx";

export const islandRegistry = {
    DemoWidget,
    TableOfContents,
} satisfies Record<string, ComponentType<any>>;

export type IslandName = keyof typeof islandRegistry;
