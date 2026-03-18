import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { contentDirectory, articlesDirectory } from "../shared/paths.ts";

function toKebabCase(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function todayString(): string {
    return new Date().toISOString().slice(0, 10);
}

function createArticle(
    title: string,
    series?: string,
    seriesOrder?: number,
): void {
    const slug = toKebabCase(title);
    const filePath = join(articlesDirectory, `${slug}.mdx`);

    if (existsSync(filePath)) {
        console.error(`Already exists: ${filePath}`);
        process.exit(1);
    }

    const lines = [
        "---",
        `title: "${title}"`,
        `description: ""`,
        `published: ${todayString()}`,
        `layout: article`,
    ];

    if (series) {
        lines.push(`series: "${series}"`);
        if (seriesOrder !== undefined) {
            lines.push(`seriesOrder: ${seriesOrder}`);
        }
    }

    lines.push("---", "", "");

    mkdirSync(articlesDirectory, { recursive: true });
    writeFileSync(filePath, lines.join("\n"));
    console.log(`Created ${filePath}`);
}

function createPage(title: string): void {
    const slug = toKebabCase(title);
    const filePath = join(contentDirectory, `${slug}.mdx`);

    if (existsSync(filePath)) {
        console.error(`Already exists: ${filePath}`);
        process.exit(1);
    }

    const lines = ["---", `title: "${title}"`, "---", "", ""];

    writeFileSync(filePath, lines.join("\n"));
    console.log(`Created ${filePath}`);
}

function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === "article") {
        const title = args[1];
        if (!title) {
            console.error(
                "Usage: pnpm create-article <title> [--series <name> --series-order <n>]",
            );
            process.exit(1);
        }

        let series: string | undefined;
        let seriesOrder: number | undefined;

        const seriesIdx = args.indexOf("--series");
        if (seriesIdx !== -1) {
            series = args[seriesIdx + 1];
        }

        const orderIdx = args.indexOf("--series-order");
        if (orderIdx !== -1) {
            seriesOrder = parseInt(args[orderIdx + 1], 10);
        }

        createArticle(title, series, seriesOrder);
    } else if (command === "page") {
        const title = args[1];
        if (!title) {
            console.error("Usage: pnpm create-page <title>");
            process.exit(1);
        }
        createPage(title);
    } else {
        console.error("Usage:");
        console.error(
            "  pnpm create-article <title> [--series <name> --series-order <n>]",
        );
        console.error("  pnpm create-page <title>");
        process.exit(1);
    }
}

main();
