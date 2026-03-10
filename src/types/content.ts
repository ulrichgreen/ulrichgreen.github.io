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
    note?: string;
    summary?: string;
    print?: boolean;
}

export interface FrontmatterPayload {
    meta: PageMeta;
    body: string;
}

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

export interface WritingIndexEntry extends PageMeta {
    title: string;
    published: string;
    slug: string;
    href: string;
}

export interface BaseLayoutProps {
    title?: string;
    description?: string;
    section?: string;
    children?: ReactNode;
}

export interface ArticleLayoutProps extends BaseLayoutProps {
    published?: string;
    revised?: string;
    words?: number | string;
    note?: string;
}
