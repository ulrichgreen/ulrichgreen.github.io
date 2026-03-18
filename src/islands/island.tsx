import { createElement, type ComponentType } from "preact/compat";
import { renderToString } from "preact-render-to-string";
import { useRenderContext } from "../context/render-context.tsx";
import { islandRegistry } from "./registry.ts";
import type { IslandName } from "./registry.ts";

export type HydrationStrategy = "load" | "visible" | "idle" | "interaction";

interface IslandProps {
    name: IslandName;
    props: object;
    hydrate?: HydrationStrategy;
}

export function Island({ name, props, hydrate }: IslandProps) {
    const { registerIsland } = useRenderContext();
    const id = registerIsland({
        name,
        props: props as Record<string, unknown>,
    });

    const Component = islandRegistry[name] as ComponentType<object>;

    return (
        <div
            className="island-root"
            data-island={name}
            data-island-id={id}
            data-island-props={JSON.stringify(props)}
            data-hydrate={hydrate || "load"}
            dangerouslySetInnerHTML={{
                __html: renderToString(createElement(Component, props)),
            }}
        />
    );
}
