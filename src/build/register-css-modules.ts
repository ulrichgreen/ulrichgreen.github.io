import { isAbsolute, resolve as resolvePath } from "node:path";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getCssModuleRuntimePath, isCssModuleFilePath } from "../styles/css-modules.ts";

function resolveCssModuleUrl(specifier: string, parentURL?: string): string {
    if (specifier.startsWith("file://")) {
        return specifier;
    }

    if (specifier.startsWith("/")) {
        return pathToFileURL(specifier).href;
    }

    if (parentURL) {
        return new URL(specifier, parentURL).href;
    }

    const absolutePath = isAbsolute(specifier)
        ? specifier
        : resolvePath(process.cwd(), specifier);
    return pathToFileURL(absolutePath).href;
}

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (isCssModuleFilePath(specifier)) {
            const runtimePath = getCssModuleRuntimePath(
                fileURLToPath(resolveCssModuleUrl(specifier, context.parentURL)),
            );
            return {
                url: pathToFileURL(runtimePath).href,
                format: "module",
                shortCircuit: true,
            };
        }

        return nextResolve(specifier, context);
    },
});