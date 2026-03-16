import type { ComponentType, ReactNode } from "preact/compat";

export type LayoutName = "article" | "base";

interface SharedMeta {
    title: string;
    description?: string;
    section?: string;
    summary?: string;
    pagePath?: string;
    words?: number | string;
    readingTime?: string;
    published?: string;
    revised?: string;
}

export interface BasePageMeta extends SharedMeta {
    layout: "base";
}

export interface Revision {
    date: string;
    note: string;
}

export interface ArticlePageMeta extends SharedMeta {
    layout: "article";
    published: string;
    note?: string;
    revisions?: Revision[];
    series?: string;
    seriesOrder?: number;
}

export type PageMeta = BasePageMeta | ArticlePageMeta;

export function isArticleMeta(meta: PageMeta): meta is ArticlePageMeta {
    return meta.layout === "article";
}

export interface SeriesEntry {
    title: string;
    slug: string;
    href: string;
    order: number;
    published: string;
}

export interface SeriesInfo {
    name: string;
    entries: SeriesEntry[];
    currentOrder: number;
}

export interface FrontmatterPayload {
    meta: PageMeta;
    body: string;
}

// ComponentType<any> is required here because Preact's stricter contravariance
// means specific-prop components can't satisfy ComponentType<Record<string, unknown>>.
export type ContentComponentMap = Record<string, ComponentType<any>>;

export interface MdxContentProps {
    components?: ContentComponentMap;
}

export type ContentBodyComponent = ComponentType<MdxContentProps>;

export interface BuiltContent {
    meta: PageMeta;
    Content: ContentBodyComponent;
    sourcePath: string;
}

export interface ArticleIndexEntry extends ArticlePageMeta {
    title: string;
    published: string;
    slug: string;
    href: string;
}

export interface BaseLayoutProps {
    title?: string;
    description?: string;
    section?: string;
    pagePath?: string;
    published?: string;
    revised?: string;
    mainClassName?: string;
    seriesName?: string;
    children?: ReactNode;
}

export interface ArticleLayoutProps extends BaseLayoutProps {
    published: string;
    words?: number | string;
    readingTime?: string;
    note?: string;
    revisions?: Revision[];
    seriesInfo?: SeriesInfo;
}
