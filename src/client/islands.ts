import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { islandRegistry } from "../islands/registry.ts";

function hydrateIsland(root: HTMLElement): void {
    if (root.dataset.hydrated === "true") return;

    const name = root.dataset.island;
    if (!name || !(name in islandRegistry)) return;

    const Component = islandRegistry[name as keyof typeof islandRegistry];
    const rawProps = root.getAttribute("data-island-props") || "{}";

    let props: Record<string, unknown>;
    try {
        props = JSON.parse(rawProps) as Record<string, unknown>;
    } catch {
        return;
    }

    const identifierPrefix = `${root.dataset.islandId || name}-`;

    hydrateRoot(root, createElement(Component, props), { identifierPrefix });
    root.dataset.hydrated = "true";
}

function bootIslands() {
    document.querySelectorAll<HTMLElement>("[data-island]").forEach((root) => {
        if (root.dataset.hydrated === "true") return;

        const strategy = root.dataset.hydrate || "load";

        switch (strategy) {
            case "visible":
                scheduleVisible(root);
                break;
            case "idle":
                scheduleIdle(root);
                break;
            case "interaction":
                scheduleInteraction(root);
                break;
            default:
                hydrateIsland(root);
                break;
        }
    });
}

function scheduleVisible(root: HTMLElement): void {
    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    observer.disconnect();
                    hydrateIsland(root);
                    return;
                }
            }
        },
        { rootMargin: "200px" },
    );
    observer.observe(root);
}

function scheduleIdle(root: HTMLElement): void {
    const callback = () => hydrateIsland(root);
    if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(callback);
    } else {
        setTimeout(callback, 200);
    }
}

function scheduleInteraction(root: HTMLElement): void {
    const events = ["click", "focusin", "mouseover", "touchstart"] as const;
    const handler = () => {
        for (const event of events) {
            root.removeEventListener(event, handler);
        }
        hydrateIsland(root);
    };
    for (const event of events) {
        root.addEventListener(event, handler, { passive: true });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootIslands, { once: true });
} else {
    bootIslands();
}
