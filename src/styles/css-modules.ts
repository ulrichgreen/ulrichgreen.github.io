import { transform, type CSSModuleExports, type CSSModuleReference } from "lightningcss";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BROWSER_TARGETS } from "../config.ts";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const sourceRoot = fileURLToPath(new URL("../", import.meta.url));
const runtimeDirectory = join(tmpdir(), "ulrich-green-css-modules");

const targets = {
    chrome: BROWSER_TARGETS.chrome << 16,
    firefox: BROWSER_TARGETS.firefox << 16,
    safari: BROWSER_TARGETS.safari << 16,
};

interface CompiledCssModule {
    css: string;
    exports: CSSModuleExports;
    classes?: Record<string, string>;
}

const moduleCache = new Map<string, CompiledCssModule>();

export function isCssModuleFilePath(filePath: string): boolean {
    return filePath.endsWith(".module.css");
}

function collectCssModuleFiles(directory: string): string[] {
    const files: string[] = [];

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const entryPath = join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...collectCssModuleFiles(entryPath));
            continue;
        }

        if (entry.isFile() && isCssModuleFilePath(entryPath)) {
            files.push(entryPath);
        }
    }

    return files.sort();
}

function compileModule(filePath: string): CompiledCssModule {
    const cached = moduleCache.get(filePath);
    if (cached) {
        return cached;
    }

    const { code, exports } = transform({
        filename: filePath,
        code: Buffer.from(readFileSync(filePath)),
        minify: true,
        projectRoot,
        targets,
        cssModules: {
            pattern: "[hash]_[local]",
        },
    });

    const compiled: CompiledCssModule = {
        css: Buffer.from(code).toString("utf8"),
        exports: exports ?? {},
    };

    moduleCache.set(filePath, compiled);
    return compiled;
}

function resolveExportClassNames(
    filePath: string,
    exportName: string,
    seen: Set<string>,
): string[] {
    const visitKey = `${filePath}:${exportName}`;
    if (seen.has(visitKey)) {
        throw new Error(`Circular CSS module composition detected for ${visitKey}`);
    }

    seen.add(visitKey);

    const compiled = compileModule(filePath);
    const exportedClass = compiled.exports[exportName];
    if (!exportedClass) {
        throw new Error(`Unknown CSS module export \"${exportName}\" in ${filePath}`);
    }

    const names = [exportedClass.name];

    for (const reference of exportedClass.composes) {
        names.push(...resolveReferenceClassNames(filePath, reference, seen));
    }

    seen.delete(visitKey);
    return names;
}

function resolveReferenceClassNames(
    filePath: string,
    reference: CSSModuleReference,
    seen: Set<string>,
): string[] {
    switch (reference.type) {
        case "local":
            return resolveExportClassNames(filePath, reference.name, seen);
        case "global":
            return [reference.name];
        case "dependency": {
            const dependencyPath = resolve(dirname(filePath), reference.specifier);
            return resolveExportClassNames(dependencyPath, reference.name, seen);
        }
    }
}

function resolveCssModuleClasses(filePath: string): Record<string, string> {
    const compiled = compileModule(filePath);
    if (compiled.classes) {
        return compiled.classes;
    }

    const classes: Record<string, string> = {};
    for (const exportName of Object.keys(compiled.exports)) {
        classes[exportName] = [...new Set(
            resolveExportClassNames(filePath, exportName, new Set()),
        )].join(" ");
    }

    compiled.classes = classes;
    return classes;
}

export function getCssModuleExports(filePath: string): Record<string, string> {
    return resolveCssModuleClasses(filePath);
}

export function getCssModuleModuleSource(filePath: string): string {
    const classes = getCssModuleExports(filePath);
    return `const styles = ${JSON.stringify(classes)};\nexport default styles;\n`;
}

export function getCssModuleRuntimePath(filePath: string): string {
    mkdirSync(runtimeDirectory, { recursive: true });

    const source = getCssModuleModuleSource(filePath);
    const fileHash = createHash("sha256")
        .update(filePath)
        .update("\0")
        .update(source)
        .digest("hex")
        .slice(0, 16);
    const runtimePath = join(runtimeDirectory, `${fileHash}.mjs`);

    writeFileSync(runtimePath, source);
    return runtimePath;
}

export function buildCssModuleBundle(directory: string = sourceRoot): string {
    return collectCssModuleFiles(directory)
        .map((filePath) => compileModule(filePath).css)
        .filter(Boolean)
        .join("\n");
}