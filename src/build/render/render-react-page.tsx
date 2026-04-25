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

export type IslandUsage = Record<string, number>;

export interface RenderedPage {
    html: string;
    islands: IslandUsage;
}

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
    content: BuiltContent,
): {
    context: RenderContextValue;
    hasIslands: () => boolean;
    getIslandUsage: () => IslandUsage;
} {
    const islands = new Map<string, number>();
    const registerIsland = ({ name }: RegisterIslandInput): string => {
        const count = (islands.get(name) ?? 0) + 1;
        islands.set(name, count);
        return `${name.toLowerCase()}-${count}`;
    };
    const hasIslands = () => islands.size > 0;
    const getIslandUsage = () =>
        Object.fromEntries(islands.entries()) as IslandUsage;
    return {
        context: {
            articleIndex,
            headings: content.headings,
            registerIsland,
            assetManifest,
            hasIslands,
        },
        hasIslands,
        getIslandUsage,
    };
}

export function renderContentBody(
    content: BuiltContent,
    articleIndex: ArticleIndexEntry[],
    assetManifest: AssetManifest = defaultAssetManifest,
): string {
    const { context } = createRenderContext(articleIndex, assetManifest, content);
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
    return renderPageWithMetadata(
        content,
        articleIndex,
        assetManifest,
        seriesInfo,
    ).html;
}

export function renderPageWithMetadata(
    content: BuiltContent,
    articleIndex: ArticleIndexEntry[],
    assetManifest: AssetManifest = defaultAssetManifest,
    seriesInfo?: SeriesInfo,
): RenderedPage {
    const { context, getIslandUsage } = createRenderContext(
        articleIndex,
        assetManifest,
        content,
    );

    const meta = {
        ...content.meta,
        pagePath: derivePagePath(content.sourcePath),
    };

    const body = createElement(content.Content, {
        components: getContentComponents(),
    });

    const page = renderLayout(meta, body, seriesInfo);

    return {
        html: `<!doctype html>\n${renderToStaticMarkup(
            <RenderContext.Provider value={context}>{page}</RenderContext.Provider>,
        )}`,
        islands: getIslandUsage(),
    };
}
