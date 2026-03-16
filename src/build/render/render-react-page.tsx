import { createElement } from "preact/compat";
import { renderToStaticMarkup } from "preact-render-to-string";
import { getContentComponents } from "../../content-components.tsx";
import type { BuiltContent, SeriesInfo, ArticleIndexEntry } from "../../types/content.ts";
import type { RegisterIslandInput } from "../../types/islands.ts";
import type { AssetManifest } from "../assets/asset-manifest.ts";
import { renderLayout } from "./layouts.tsx";
import {
    defaultAssetManifest,
    RenderContext,
    type RenderContextValue,
} from "../../context/render-context.tsx";

function derivePagePath(sourcePath: string): string {
    const marker = "/content/";
    const idx = sourcePath.indexOf(marker);
    if (idx === -1) return "/";
    return (
        "/" + sourcePath.slice(idx + marker.length).replace(/\.mdx$/, ".html")
    );
}

function createRenderContext(
    articleIndex: ArticleIndexEntry[],
    assetManifest: AssetManifest,
): { context: RenderContextValue; hasIslands: () => boolean } {
    let islandCount = 0;
    const registerIsland = ({ name }: RegisterIslandInput): string => {
        islandCount += 1;
        return `${name.toLowerCase()}-${islandCount}`;
    };
    const hasIslands = () => islandCount > 0;
    return {
        context: { articleIndex, registerIsland, assetManifest, hasIslands },
        hasIslands,
    };
}

export function renderContentBody(
    content: BuiltContent,
    articleIndex: ArticleIndexEntry[],
    assetManifest: AssetManifest = defaultAssetManifest,
): string {
    const { context } = createRenderContext(articleIndex, assetManifest);
    const body = createElement(content.Content, {
        components: getContentComponents(),
    });
    return renderToStaticMarkup(
        createElement(RenderContext.Provider, { value: context }, body),
    );
}

export function renderPage(
    content: BuiltContent,
    articleIndex: ArticleIndexEntry[],
    assetManifest: AssetManifest = defaultAssetManifest,
    seriesInfo?: SeriesInfo,
): string {
    const { context } = createRenderContext(articleIndex, assetManifest);

    const meta = {
        ...content.meta,
        pagePath: derivePagePath(content.sourcePath),
    };

    const body = createElement(content.Content, {
        components: getContentComponents(),
    });

    const page = renderLayout(meta, body, seriesInfo);

    return `<!doctype html>\n${renderToStaticMarkup(
        <RenderContext.Provider value={context}>{page}</RenderContext.Provider>,
    )}`;
}
