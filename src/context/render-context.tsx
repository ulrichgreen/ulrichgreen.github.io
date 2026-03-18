import { createContext, useContext } from "preact/compat";
import type { AssetManifest } from "../build/assets/asset-manifest.ts";
import type { ArticleIndexEntry, ContentHeading } from "../types/content.ts";
import type { RegisterIslandInput } from "../types/islands.ts";

export const defaultAssetManifest: AssetManifest = {
    "style.css": "style.css",
    "site.js": "site.js",
    "islands.js": "islands.js",
};

export interface RenderContextValue {
    articleIndex: ArticleIndexEntry[];
    headings: ContentHeading[];
    registerIsland: (entry: RegisterIslandInput) => string;
    assetManifest: AssetManifest;
    hasIslands: () => boolean;
}

function missingContext(): never {
    throw new Error("Render context is not available for this component.");
}

export const RenderContext = createContext<RenderContextValue>({
    articleIndex: [],
    headings: [],
    registerIsland: missingContext,
    assetManifest: defaultAssetManifest,
    hasIslands: () => false,
});

export function useRenderContext(): RenderContextValue {
    return useContext(RenderContext);
}
