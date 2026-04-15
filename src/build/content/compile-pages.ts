import { availableParallelism } from "node:os";
import { buildContent } from "./build-content.ts";
import type { BuiltContent } from "../../types/content.ts";

export interface CompileResult {
    compiled: BuiltContent[];
    failed: { file: string; error: unknown }[];
}

export async function compilePages(
    sourceFiles: string[],
): Promise<CompileResult> {
    const results: PromiseSettledResult<BuiltContent>[] = new Array(
        sourceFiles.length,
    );
    const concurrency = Math.min(sourceFiles.length, 4, availableParallelism());
    let nextIndex = 0;

    async function worker(): Promise<void> {
        while (nextIndex < sourceFiles.length) {
            const currentIndex = nextIndex;
            nextIndex += 1;

            try {
                results[currentIndex] = {
                    status: "fulfilled",
                    value: await buildContent(sourceFiles[currentIndex]),
                };
            } catch (error) {
                results[currentIndex] = {
                    status: "rejected",
                    reason: error,
                };
            }
        }
    }

    await Promise.all(
        Array.from({ length: concurrency }, () => worker()),
    );

    const compiled: BuiltContent[] = [];
    const failed: { file: string; error: unknown }[] = [];
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === "fulfilled") {
            compiled.push(result.value);
        } else {
            failed.push({ file: sourceFiles[i], error: result.reason });
        }
    }
    return { compiled, failed };
}
