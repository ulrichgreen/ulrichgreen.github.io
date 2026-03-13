import type { ComponentType, ReactNode } from "react";

export type LayoutName = "article" | "base";

export interface PageMeta {
    title: string;
    description?: string;
    layout: LayoutName;
    section?: string;
    published?: string;
    revised?: string;
    words?: number | string;
    readingTime?: string;
    note?: string;
    summary?: string;
    pagePath?: string;
    series?: string;
    seriesOrder?: number;
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

export type ContentComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

export interface MdxContentProps {
    components?: ContentComponentMap;
}

export type ContentBodyComponent = ComponentType<MdxContentProps>;

export interface BuiltContent {
    meta: PageMeta;
    Content: ContentBodyComponent;
    sourcePath: string;
}

export interface WritingIndexEntry extends PageMeta {
    title: string;
    published: string;
    slug: string;
    href: string;
    series?: string;
    seriesOrder?: number;
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
    published?: string;
    revised?: string;
    words?: number | string;
    readingTime?: string;
    note?: string;
    seriesInfo?: SeriesInfo;
}
