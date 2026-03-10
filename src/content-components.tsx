import { ArticleList } from "./components/article-list.tsx";
import { DemoWidget } from "./islands/demo-widget.tsx";
import type { ContentComponentMap } from "./types/content.ts";

const contentComponents = {
    ArticleList,
    DemoWidget,
} satisfies ContentComponentMap;

export function getContentComponents(): ContentComponentMap {
    return contentComponents;
}
