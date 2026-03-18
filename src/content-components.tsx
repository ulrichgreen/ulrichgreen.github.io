import { ArticleList } from "./components/article-list.tsx";
import { Callout } from "./components/callout.tsx";
import { Code } from "./components/code.tsx";
import { Figure } from "./components/figure.tsx";
import { Hero } from "./components/hero/hero.tsx";
import { TableOfContents } from "./components/table-of-contents.tsx";
import { DemoWidget } from "./islands/demo-widget.tsx";
import type { ContentComponentMap } from "./types/content.ts";

const contentComponents = {
    ArticleList,
    Callout,
    Code,
    Figure,
    Hero,
    TableOfContents,
    DemoWidget,
} satisfies ContentComponentMap;

export function getContentComponents(): ContentComponentMap {
    return contentComponents;
}
