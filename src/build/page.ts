import { buildContent } from "./build-content.ts";
import { renderPage } from "./render-react-page.tsx";
import { listWritingEntries } from "./writing-index.ts";
import { writingDirectory } from "./paths.ts";

async function main() {
    const sourceFile = process.argv[2];
    if (!sourceFile) {
        throw new Error("page.ts: expected a content file path argument");
    }

    const page = await buildContent(sourceFile);
    const writingIndex = listWritingEntries(writingDirectory);

    process.stdout.write(renderPage(page, writingIndex));
}

main().catch((error) => {
    process.stderr.write(`${String(error)}\n`);
    process.exit(1);
});
