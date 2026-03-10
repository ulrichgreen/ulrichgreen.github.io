import { readFileSync } from "node:fs";
import { compileMdx } from "./compile-mdx.ts";
import { parseFrontmatter } from "./frontmatter.ts";
import type { BuiltContent, FrontmatterPayload } from "../types/content.ts";

const DESCRIPTION_MAX_LENGTH = 160;

function normalizeTitle(value: string): string {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function collapseWhitespace(value: string): string {
    return value.replace(/\s+/g, " ").trim();
}

function stripMdxSyntax(value: string): string {
    return value
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^\s*>+\s?/gm, "")
        .replace(/^\s*[-*+]\s+/gm, "")
        .replace(/^\s*\d+\.\s+/gm, "")
        .replace(/^\s*[-]{3,}\s*$/gm, " ")
        .replace(/<\/?[^>]+>/g, " ")
        .replace(/\{[^{}]*\}/g, " ")
        .replace(/[*_~]/g, " ");
}

function truncateDescription(value: string): string {
    if (value.length <= DESCRIPTION_MAX_LENGTH) {
        return value;
    }

    const clipped = value.slice(0, DESCRIPTION_MAX_LENGTH + 1);
    const wordBoundary = clipped.lastIndexOf(" ");
    const end = wordBoundary > 100 ? wordBoundary : DESCRIPTION_MAX_LENGTH;

    return `${clipped.slice(0, end).trimEnd()}...`;
}

function extractDescriptionFromMdx(
    body: string,
    title?: string,
): string | undefined {
    const normalizedTitle = normalizeTitle(title || "");

    for (const block of body.split(/\n\s*\n/g)) {
        const trimmed = block.trim();
        if (!trimmed || /^\s*(import|export)\s/.test(trimmed)) {
            continue;
        }

        const candidate = collapseWhitespace(stripMdxSyntax(trimmed));
        if (!candidate) {
            continue;
        }

        if (trimmed.startsWith("#")) {
            if (
                normalizedTitle &&
                normalizeTitle(candidate) === normalizedTitle
            ) {
                continue;
            }

            continue;
        }

        return truncateDescription(candidate);
    }

    return undefined;
}

function stripDuplicateArticleTitle(
    input: FrontmatterPayload,
): FrontmatterPayload {
    if (input.meta.section !== "writing" || !input.meta.title) {
        return input;
    }

    const match = input.body.match(/^(\s*#\s+([^\n]+)\n+)/);
    if (!match) {
        return input;
    }

    if (
        normalizeTitle(stripMdxSyntax(match[2])) !==
        normalizeTitle(String(input.meta.title))
    ) {
        return input;
    }

    return {
        ...input,
        body: input.body.slice(match[0].length),
    };
}

export function resolveMetaDescription(
    input: FrontmatterPayload,
): string | undefined {
    const explicit = collapseWhitespace(
        String(input.meta.description || input.meta.summary || ""),
    );

    if (explicit) {
        return truncateDescription(explicit);
    }

    return extractDescriptionFromMdx(
        input.body,
        typeof input.meta.title === "string" ? input.meta.title : undefined,
    );
}

export async function buildContent(filePath: string): Promise<BuiltContent> {
    const raw = readFileSync(filePath, "utf8");
    const stripped = stripDuplicateArticleTitle(parseFrontmatter(raw));
    const description = resolveMetaDescription(stripped);
    const meta = description
        ? { ...stripped.meta, description }
        : { ...stripped.meta };

    return {
        meta,
        Content: await compileMdx(stripped.body, filePath),
        sourcePath: filePath,
    };
}
