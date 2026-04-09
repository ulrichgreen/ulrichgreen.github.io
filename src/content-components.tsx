import { ArticleList } from "./components/article-list/article-list.tsx";
import { Callout } from "./components/callout/callout.tsx";
import { Code } from "./components/code/code.tsx";
import { DemoWidget } from "./components/demo-widget/demo-widget.tsx";
import { Figure } from "./components/figure/figure.tsx";
import { Hero } from "./components/hero/hero.tsx";
import { Manifesto } from "./components/manifesto/manifesto.tsx";
import { TableOfContents } from "./components/table-of-contents/table-of-contents.tsx";
import type { ContentComponentMap } from "./types/content.ts";

const contentComponents = {
    ArticleList,
    Callout,
    Code,
    Figure,
    Hero,
    Manifesto,
    TableOfContents,
    DemoWidget,
} satisfies ContentComponentMap;

export function getContentComponents(): ContentComponentMap {
    return contentComponents;
}
