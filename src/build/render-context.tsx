import { createContext, useContext } from "react";
import type { AssetManifest } from "./asset-manifest.ts";
import type { WritingIndexEntry } from "../types/content.ts";
import type { RegisterIslandInput } from "../types/islands.ts";

const defaultAssetManifest: AssetManifest = {
    "style.css": "style.css",
    "site.js": "site.js",
    "islands.js": "islands.js",
};

export interface RenderContextValue {
    writingIndex: WritingIndexEntry[];
    registerIsland: (entry: RegisterIslandInput) => string;
    assetManifest: AssetManifest;
    hasIslands: () => boolean;
}

function missingContext(): never {
    throw new Error("Render context is not available for this component.");
}

export const RenderContext = createContext<RenderContextValue>({
    writingIndex: [],
    registerIsland: missingContext,
    assetManifest: defaultAssetManifest,
    hasIslands: () => false,
});

export function useRenderContext(): RenderContextValue {
    return useContext(RenderContext);
}
