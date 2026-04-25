import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
    createContentAudit,
    formatContentAuditReport,
} from "../content/audit.ts";
import { compilePages } from "../content/compile-pages.ts";
import { discoverSourceFiles } from "../content/discover.ts";
import { listArticleEntriesFromBuiltContent } from "../content/article-index.ts";
import { validateContentContracts } from "../content/contracts.ts";

export async function auditContent(): Promise<void> {
    const sourceFiles = discoverSourceFiles();
    const { compiled, failed } = await compilePages(sourceFiles);

    if (failed.length > 0) {
        for (const { file, error } of failed) {
            process.stderr.write(`  error  ${file}\n  ${String(error)}\n`);
        }
        throw new Error(`Content audit failed: ${failed.length} page(s) had errors`);
    }

    const articleIndex = listArticleEntriesFromBuiltContent(compiled);
    validateContentContracts({ articleIndex, builtContent: compiled });

    const sourceTextByPath = new Map(
        sourceFiles.map((file) => [file, readFileSync(file, "utf8")]),
    );

    process.stdout.write(
        formatContentAuditReport(
            createContentAudit({
                builtContent: compiled,
                articleIndex,
                sourceTextByPath,
            }),
        ),
    );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    auditContent().catch((error) => {
        process.stderr.write(`${String(error)}\n`);
        process.exit(1);
    });
}
