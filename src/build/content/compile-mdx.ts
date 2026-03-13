import { pathToFileURL } from "node:url";
import * as runtime from "react/jsx-runtime";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { ContentBodyComponent } from "../../types/content.ts";

const MDX_ESM_PATTERN = /^\s*(import|export)\s/m;

function assertSupportedMdx(body: string, filePath: string) {
    if (MDX_ESM_PATTERN.test(body)) {
        throw new Error(
            `${filePath}: MDX ESM is disabled. Use approved components from src/content-components.tsx instead.`,
        );
    }
}

const mdxImport = import("@mdx-js/mdx");

export async function compileMdx(
    body: string,
    filePath: string,
): Promise<ContentBodyComponent> {
    assertSupportedMdx(body, filePath);

    const { evaluate } = await mdxImport;

    const module = (await evaluate(
        { value: body, path: filePath },
        {
            ...runtime,
            baseUrl: pathToFileURL(filePath),
            development: false,
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
                rehypeSlug,
                [
                    rehypePrettyCode,
                    { theme: "github-dark", keepBackground: true },
                ],
                [rehypeAutolinkHeadings, { behavior: "append" }],
            ],
        },
    )) as {
        default: ContentBodyComponent;
    };

    return module.default;
}
