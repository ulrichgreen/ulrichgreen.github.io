import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { islandRegistry } from "../islands/registry.ts";

function bootIslands() {
    document.querySelectorAll<HTMLElement>("[data-island]").forEach((root) => {
        if (root.dataset.hydrated === "true") {
            return;
        }

        const name = root.dataset.island as keyof typeof islandRegistry;
        const Component = islandRegistry[name];
        if (!Component) {
            return;
        }

        const rawProps = root.getAttribute("data-island-props") || "{}";
        const props = JSON.parse(rawProps) as Record<string, unknown>;
        const identifierPrefix = `${root.dataset.islandId || String(name)}-`;

        hydrateRoot(root, createElement(Component, props), {
            identifierPrefix,
        });
        root.dataset.hydrated = "true";
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootIslands, { once: true });
} else {
    bootIslands();
}
