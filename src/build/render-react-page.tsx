import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getContentComponents } from "../content-components.tsx";
import type { BuiltContent, WritingIndexEntry } from "../types/content.ts";
import type { RegisterIslandInput } from "../types/islands.ts";
import type { AssetManifest } from "./asset-manifest.ts";
import { renderLayout } from "./layouts.tsx";
import { RenderContext } from "./render-context.tsx";

const defaultManifest: AssetManifest = {
    "style.css": "style.css",
    "site.js": "site.js",
    "islands.js": "islands.js",
};

function derivePagePath(sourcePath: string): string {
    const marker = "/content/";
    const idx = sourcePath.indexOf(marker);
    if (idx === -1) return "/";
    return "/" + sourcePath.slice(idx + marker.length).replace(/\.mdx$/, ".html");
}

export function renderPage(
    content: BuiltContent,
    writingIndex: WritingIndexEntry[],
    assetManifest: AssetManifest = defaultManifest,
): string {
    let islandCount = 0;
    const registerIsland = ({ name }: RegisterIslandInput): string => {
        islandCount += 1;
        return `${name.toLowerCase()}-${islandCount}`;
    };

    const meta = { ...content.meta, pagePath: derivePagePath(content.sourcePath) };

    const body = createElement(content.Content, {
        components: getContentComponents(),
    });

    const page = renderLayout(meta, body);

    return `<!doctype html>\n${renderToStaticMarkup(
        <RenderContext.Provider value={{ writingIndex, registerIsland, assetManifest }}>
            {page}
        </RenderContext.Provider>,
    )}`;
}
