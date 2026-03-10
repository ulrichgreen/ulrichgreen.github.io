import matter from "gray-matter";
import { createInterface } from "node:readline";
import type { FrontmatterPayload } from "../types/content.ts";

export function parseFrontmatter(raw: string): FrontmatterPayload {
    if (!raw.trim()) {
        throw new Error("frontmatter.ts: input is empty");
    }

    const { data, content } = matter(raw);

    return {
        meta: data,
        body: content,
    };
}

function main() {
    const chunks: string[] = [];
    const rl = createInterface({ input: process.stdin, terminal: false });

    rl.on("line", (line) => chunks.push(line));
    rl.on("close", () => {
        try {
            process.stdout.write(
                JSON.stringify(parseFrontmatter(chunks.join("\n"))),
            );
        } catch (error) {
            process.stderr.write(`${String(error)}\n`);
            process.exit(1);
        }
    });
}

if (
    process.argv[1] &&
    new URL(process.argv[1], "file:").href === import.meta.url
) {
    main();
}
