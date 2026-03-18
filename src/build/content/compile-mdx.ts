import { pathToFileURL } from "node:url";
import * as runtime from "preact/jsx-runtime";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { ContentBodyComponent, ContentHeading } from "../../types/content.ts";

const MDX_ESM_PATTERN = /^\s*(import|export)\s/m;

type HastNode = {
    type: string;
    tagName?: string;
    value?: string;
    properties?: Record<string, unknown>;
    children?: HastNode[];
};

const CODE_THEME = {
    name: "site-code",
    settings: [
        {
            settings: {
                foreground: "var(--ct)",
            },
        },
        {
            scope: ["comment", "punctuation.definition.comment"],
            settings: {
                foreground: "var(--cc)",
                fontStyle: "italic",
            },
        },
        {
            scope: [
                "keyword",
                "storage",
                "storage.type",
                "keyword.control",
                "keyword.operator",
            ],
            settings: {
                foreground: "var(--ck)",
            },
        },
        {
            scope: [
                "entity.name.function",
                "support.function",
                "meta.function-call",
            ],
            settings: {
                foreground: "var(--cf)",
            },
        },
        {
            scope: ["string", "string.quoted", "string.template"],
            settings: {
                foreground: "var(--cs)",
            },
        },
        {
            scope: [
                "constant.numeric",
                "constant.language",
                "constant.character.escape",
            ],
            settings: {
                foreground: "var(--cn)",
            },
        },
        {
            scope: ["variable", "variable.parameter", "identifier"],
            settings: {
                foreground: "var(--cv)",
            },
        },
        {
            scope: ["entity.name.type", "support.type", "entity.name.class"],
            settings: {
                foreground: "var(--cy)",
            },
        },
        {
            scope: ["entity.name.tag", "support.class.component"],
            settings: {
                foreground: "var(--cg)",
            },
        },
        {
            scope: ["entity.other.attribute-name"],
            settings: {
                foreground: "var(--ca)",
            },
        },
        {
            scope: ["punctuation", "meta.brace", "meta.delimiter"],
            settings: {
                foreground: "var(--cp)",
            },
        },
    ],
};

function formatCodeLanguage(value: string): string {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return "code";

    const knownLabels: Record<string, string> = {
        css: "CSS",
        html: "HTML",
        javascript: "JavaScript",
        js: "JavaScript",
        json: "JSON",
        jsx: "JSX",
        md: "Markdown",
        mdx: "MDX",
        shell: "Shell",
        text: "Text",
        ts: "TypeScript",
        tsx: "TSX",
        typescript: "TypeScript",
        xml: "XML",
        yaml: "YAML",
        yml: "YAML",
    };

    if (knownLabels[normalized]) return knownLabels[normalized];

    return normalized
        .split(/[-_]/g)
        .filter(Boolean)
        .map((segment) => segment.slice(0, 1).toUpperCase() + segment.slice(1))
        .join(" ");
}

function getStringProperty(value: unknown): string | undefined {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
        return value.find((entry): entry is string => typeof entry === "string");
    }
    return undefined;
}

function classList(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((entry): entry is string => typeof entry === "string");
    }
    if (typeof value === "string") return value.split(/\s+/).filter(Boolean);
    return [];
}

function createElement(
    tagName: string,
    properties: Record<string, unknown>,
    children: HastNode[] = [],
): HastNode {
    return { type: "element", tagName, properties, children };
}

function createText(value: string): HastNode {
    return { type: "text", value };
}

function collapseWhitespace(value: string): string {
    return value.replace(/\s+/g, " ").trim();
}

function hasProperty(node: HastNode, key: string): boolean {
    return Boolean(node.properties && key in node.properties);
}

function visitTree(node: HastNode, visitor: (node: HastNode) => void): void {
    if (!node) {
        return;
    }

    visitor(node);

    for (const child of node.children || []) {
        if (!child) continue;
        visitTree(child, visitor);
    }
}

function extractNodeText(node: HastNode): string {
    if (!node) {
        return "";
    }

    if (node.type === "text") {
        return node.value ?? "";
    }

    return (node.children || []).filter(Boolean).map(extractNodeText).join("");
}

function rehypeCodeBlockChrome() {
    return (tree: HastNode) => {
        visitTree(tree, (node) => {
            if (
                node.type !== "element" ||
                node.tagName !== "figure" ||
                !hasProperty(node, "data-rehype-pretty-code-figure")
            ) {
                return;
            }

            const children = node.children || [];
            if (
                children.some(
                    (child) =>
                        child.type === "element" &&
                        classList(child.properties?.className).includes(
                            "code-block__toolbar",
                        ),
                )
            ) {
                return;
            }

            const titleIndex = children.findIndex(
                (child) =>
                    child.type === "element" &&
                    hasProperty(child, "data-rehype-pretty-code-title"),
            );
            const titleNode = titleIndex >= 0 ? children.splice(titleIndex, 1)[0] : undefined;

            const preIndex = children.findIndex(
                (child) => child.type === "element" && child.tagName === "pre",
            );
            if (preIndex < 0) return;

            const preNode = children[preIndex];
            const language =
                getStringProperty(preNode.properties?.["data-language"]) ||
                getStringProperty(node.properties?.["data-language"]) ||
                "text";

            node.properties = {
                ...node.properties,
                className: [...classList(node.properties?.className), "code-block"],
                "data-language": language,
            };

            if (titleNode) {
                titleNode.properties = {
                    ...titleNode.properties,
                    className: [
                        ...classList(titleNode.properties?.className),
                        "code-block__title",
                    ],
                };
            }

            const toolbar = createElement(
                "div",
                { className: ["code-block__toolbar"] },
                [
                    ...(titleNode ? [titleNode] : []),
                    createElement(
                        "span",
                        { className: ["code-block__language"] },
                        [createText(formatCodeLanguage(language))],
                    ),
                ],
            );

            children.splice(preIndex, 0, toolbar);
            node.children = children;
        });
    };
}

function rehypeCollectHeadings(headings: ContentHeading[]) {
    return (tree: HastNode) => {
        visitTree(tree, (node) => {
            if (
                node.type !== "element" ||
                (node.tagName !== "h2" && node.tagName !== "h3")
            ) {
                return;
            }

            const id = getStringProperty(node.properties?.id);
            const text = collapseWhitespace(extractNodeText(node));
            if (!id || !text) return;

            headings.push({
                id,
                text,
                level: node.tagName === "h2" ? 2 : 3,
            });
        });
    };
}

function assertSupportedMdx(body: string, filePath: string) {
    if (MDX_ESM_PATTERN.test(body)) {
        throw new Error(
            `${filePath}: MDX ESM is disabled. Use approved components from src/content-components.tsx instead.`,
        );
    }
}

const mdxImport = import("@mdx-js/mdx");
const shikiImport = import("shiki");

export async function compileMdx(
    body: string,
    filePath: string,
): Promise<{ Content: ContentBodyComponent; headings: ContentHeading[] }> {
    assertSupportedMdx(body, filePath);

    const { evaluate } = await mdxImport;
    const { createHighlighter } = await shikiImport;
    const headings: ContentHeading[] = [];

    const module = (await evaluate(
        { value: body, path: filePath },
        {
            ...runtime,
            baseUrl: pathToFileURL(filePath),
            development: false,
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
                rehypeSlug,
                [rehypeCollectHeadings, headings],
                [
                    rehypePrettyCode,
                    {
                        theme: "site-code",
                        keepBackground: false,
                        getHighlighter: (
                            options: { langs?: unknown[] } & Record<string, unknown>,
                        ) =>
                            createHighlighter({
                                ...options,
                                langs: options.langs || [],
                                themes: [CODE_THEME],
                            } as never),
                    },
                ],
                rehypeCodeBlockChrome,
                [rehypeAutolinkHeadings, { behavior: "append" }],
            ],
        },
    )) as {
        default: ContentBodyComponent;
    };

    return { Content: module.default, headings };
}
