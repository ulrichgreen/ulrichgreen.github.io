import { createElement, type ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { useRenderContext } from "../build/render-context.tsx";
import type { IslandName } from "./registry.ts";

interface IslandProps<Props extends object> {
    name: IslandName;
    component: ComponentType<Props>;
    props: Props;
}

export function Island<Props extends object>({
    name,
    component,
    props,
}: IslandProps<Props>) {
    const { registerIsland } = useRenderContext();
    const id = registerIsland({
        name,
        props: props as Record<string, unknown>,
    });

    return (
        <div
            className="island-root"
            data-island={name}
            data-island-id={id}
            data-island-props={JSON.stringify(props)}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
                __html: renderToString(createElement(component, props)),
            }}
        />
    );
}
