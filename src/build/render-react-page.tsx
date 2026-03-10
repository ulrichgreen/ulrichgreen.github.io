import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getContentComponents } from "../content-components.tsx";
import type { BuiltContent, WritingIndexEntry } from "../types/content.ts";
import type { RegisterIslandInput } from "../types/islands.ts";
import { renderLayout } from "./layouts.tsx";
import { RenderContext } from "./render-context.tsx";

export function renderPage(
    content: BuiltContent,
    writingIndex: WritingIndexEntry[],
): string {
    let islandCount = 0;
    const registerIsland = ({ name }: RegisterIslandInput): string => {
        islandCount += 1;
        return `${name.toLowerCase()}-${islandCount}`;
    };

    const body = createElement(content.Content, {
        components: getContentComponents(),
    });

    const page = renderLayout(content.meta, body);

    return `<!doctype html>\n${renderToStaticMarkup(
        <RenderContext.Provider value={{ writingIndex, registerIsland }}>
            {page}
        </RenderContext.Provider>,
    )}`;
}
