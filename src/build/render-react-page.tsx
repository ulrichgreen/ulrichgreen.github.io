import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getContentComponents } from "../content-components.tsx";
import type { BuiltContent, WritingIndexEntry } from "../types/content.ts";
import type { RegisterIslandInput } from "../types/islands.ts";
import { defaultAssetManifest } from "./render-context.tsx";
import type { AssetManifest } from "./asset-manifest.ts";
import { renderLayout } from "./layouts.tsx";
import { RenderContext, type RenderContextValue } from "./render-context.tsx";

function derivePagePath(sourcePath: string): string {
    const marker = "/content/";
    const idx = sourcePath.indexOf(marker);
    if (idx === -1) return "/";
    return "/" + sourcePath.slice(idx + marker.length).replace(/\.mdx$/, ".html");
}

function createRenderContext(
    writingIndex: WritingIndexEntry[],
    assetManifest: AssetManifest,
): { context: RenderContextValue; hasIslands: () => boolean } {
    let islandCount = 0;
    const registerIsland = ({ name }: RegisterIslandInput): string => {
        islandCount += 1;
        return `${name.toLowerCase()}-${islandCount}`;
    };
    const hasIslands = () => islandCount > 0;
    return {
        context: { writingIndex, registerIsland, assetManifest, hasIslands },
        hasIslands,
    };
}

export function renderContentBody(
    content: BuiltContent,
    writingIndex: WritingIndexEntry[],
    assetManifest: AssetManifest = defaultAssetManifest,
): string {
    const { context } = createRenderContext(writingIndex, assetManifest);
    const body = createElement(content.Content, {
        components: getContentComponents(),
    });
    return renderToStaticMarkup(
        createElement(RenderContext.Provider, { value: context }, body),
    );
}

export function renderPage(
    content: BuiltContent,
    writingIndex: WritingIndexEntry[],
    assetManifest: AssetManifest = defaultAssetManifest,
): string {
    const { context } = createRenderContext(writingIndex, assetManifest);

    const meta = { ...content.meta, pagePath: derivePagePath(content.sourcePath) };

    const body = createElement(content.Content, {
        components: getContentComponents(),
    });

    const page = renderLayout(meta, body);

    return `<!doctype html>\n${renderToStaticMarkup(
        <RenderContext.Provider value={{ ...context }}>
            {page}
        </RenderContext.Provider>,
    )}`;
}
