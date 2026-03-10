import { createContext, useContext } from "react";
import type { WritingIndexEntry } from "../types/content.ts";
import type { RegisterIslandInput } from "../types/islands.ts";

export interface RenderContextValue {
    writingIndex: WritingIndexEntry[];
    registerIsland: (entry: RegisterIslandInput) => string;
}

function missingContext(): never {
    throw new Error("Render context is not available for this component.");
}

export const RenderContext = createContext<RenderContextValue>({
    writingIndex: [],
    registerIsland: missingContext,
});

export function useRenderContext(): RenderContextValue {
    return useContext(RenderContext);
}
