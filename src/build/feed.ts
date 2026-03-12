import type { BuiltContent, WritingIndexEntry } from "../types/content.ts";
import { SITE_URL } from "../config.ts";
import { writeDistFile } from "./dist-fs.ts";
import { renderContentBody } from "./render-react-page.tsx";

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

function escapeCdata(text: string): string {
    return text.replace(/]]>/g, "]]]]><![CDATA[>");
}

export async function buildFeed(
    writingIndex: WritingIndexEntry[],
    compiledWriting: BuiltContent[],
): Promise<void> {
    const latestDate =
        writingIndex.length > 0
            ? toISOTimestamp(
                  writingIndex[0].revised || writingIndex[0].published,
              )
            : new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

    const contentBySlug = new Map<string, BuiltContent>();
    for (const content of compiledWriting) {
        const slug = content.sourcePath.split("/").pop()?.replace(/\.mdx$/, "") ?? "";
        contentBySlug.set(slug, content);
    }

    const entries: string[] = [];

    for (const entry of writingIndex) {
        const content = contentBySlug.get(entry.slug);
        if (!content) {
            process.stderr.write(
                `feed.ts: no compiled content for "${entry.slug}", skipping feed entry\n`,
            );
            continue;
        }

        const bodyHtml = renderContentBody(content, writingIndex);

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
                `    <content type="html"><![CDATA[${escapeCdata(bodyHtml)}]]></content>`,
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

    writeDistFile("feed.xml", xml);
}
