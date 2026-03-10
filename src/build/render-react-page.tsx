import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getContentComponents } from "../content-components.tsx";
import BaseLayout from "../templates/base.tsx";
import ArticleLayout from "../templates/article.tsx";
import type { BuiltContent, WritingIndexEntry } from "../types/content.ts";
import type { RegisterIslandInput } from "../types/islands.ts";
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

    const page =
        content.meta.section === "writing" ? (
            <ArticleLayout {...content.meta}>{body}</ArticleLayout>
        ) : (
            <BaseLayout
                title={content.meta.title}
                description={content.meta.description}
                section={content.meta.section}
            >
                {body}
            </BaseLayout>
        );

    return `<!doctype html>\n${renderToStaticMarkup(
        <RenderContext.Provider value={{ writingIndex, registerIsland }}>
            {page}
        </RenderContext.Provider>,
    )}`;
}
