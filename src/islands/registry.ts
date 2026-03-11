import type { ComponentType } from "react";
import { DemoWidgetClient } from "./demo-widget.tsx";

export const islandRegistry = {
    DemoWidget: DemoWidgetClient,
} satisfies Record<string, ComponentType<Record<string, unknown>>>;

export type IslandName = keyof typeof islandRegistry;
