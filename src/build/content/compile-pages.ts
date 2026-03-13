import { buildContent } from "./build-content.ts";
import type { BuiltContent } from "../../types/content.ts";

export interface CompileResult {
    compiled: BuiltContent[];
    failed: { file: string; error: unknown }[];
}

export async function compilePages(
    sourceFiles: string[],
): Promise<CompileResult> {
    const results = await Promise.allSettled(
        sourceFiles.map((sourcePath) => buildContent(sourcePath)),
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
