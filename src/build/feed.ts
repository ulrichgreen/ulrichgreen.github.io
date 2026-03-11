import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildContent } from "./build-content.ts";
import { RenderContext } from "./render-context.tsx";
import { getContentComponents } from "../content-components.tsx";
import type { WritingIndexEntry } from "../types/content.ts";
import { SITE_URL } from "../config.ts";
const distDirectory = fileURLToPath(new URL("../../dist", import.meta.url));

function toISOTimestamp(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export async function buildFeed(
    writingDir: string,
    writingIndex: WritingIndexEntry[],
): Promise<void> {
    const latestDate =
        writingIndex.length > 0
            ? toISOTimestamp(
                  writingIndex[0].revised || writingIndex[0].published,
              )
            : new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

    const entries: string[] = [];

    for (const entry of writingIndex) {
        const sourcePath = join(writingDir, `${entry.slug}.mdx`);
        const content = await buildContent(sourcePath);
        const bodyElement = createElement(content.Content, {
            components: getContentComponents(),
        });
        const contextValue = {
            writingIndex,
            registerIsland: ({ name }: { name: string }) => `${name.toLowerCase()}-feed`,
            assetManifest: {
                "style.css": "style.css",
                "site.js": "site.js",
                "islands.js": "islands.js",
            } as const,
            hasIslands: () => false as boolean,
        };
        const bodyHtml = renderToStaticMarkup(
            createElement(RenderContext.Provider, { value: contextValue }, bodyElement),
        );

        const published = toISOTimestamp(entry.published);
        const updated = toISOTimestamp(entry.revised || entry.published);
        entries.push(
            [
                "  <entry>",
                `    <title>${escapeXml(entry.title)}</title>`,
                `    <link href="${SITE_URL}${entry.href}" />`,
                `    <id>${SITE_URL}${entry.href}</id>`,
                `    <published>${published}</published>`,
                `    <updated>${updated}</updated>`,
                entry.description
                    ? `    <summary>${escapeXml(entry.description)}</summary>`
                    : undefined,
                `    <content type="html"><![CDATA[${bodyHtml}]]></content>`,
                "  </entry>",
            ]
                .filter(Boolean)
                .join("\n"),
        );
    }

    const xml = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<feed xmlns="http://www.w3.org/2005/Atom">',
        "  <title>Ulrich Green</title>",
        `  <link href="${SITE_URL}/" />`,
        `  <link rel="self" href="${SITE_URL}/feed.xml" />`,
        `  <id>${SITE_URL}/</id>`,
        `  <updated>${latestDate}</updated>`,
        "  <author>",
        "    <name>Ulrich Green</name>",
        "  </author>",
        ...entries,
        "</feed>",
        "",
    ].join("\n");

    mkdirSync(distDirectory, { recursive: true });
    writeFileSync(join(distDirectory, "feed.xml"), xml);
}
