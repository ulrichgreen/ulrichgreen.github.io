import { readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { distDirectory } from "./shared/paths.ts";

export interface PerformanceBudget {
    label: string;
    extensions: string[];
    warnAtBytes: number;
    maximumBytes: number;
}

export interface PerformanceBudgetResult extends PerformanceBudget {
    bytes: number;
    status: "pass" | "warn" | "fail";
}

const kibibyte = 1024;

export const performanceBudgets: PerformanceBudget[] = [
    {
        label: "HTML",
        extensions: [".html"],
        warnAtBytes: 112 * kibibyte,
        maximumBytes: 128 * kibibyte,
    },
    {
        label: "CSS",
        extensions: [".css"],
        warnAtBytes: 28 * kibibyte,
        maximumBytes: 32 * kibibyte,
    },
    {
        label: "JS",
        extensions: [".js"],
        warnAtBytes: 36 * kibibyte,
        maximumBytes: 40 * kibibyte,
    },
    {
        label: "Fonts",
        extensions: [".woff2", ".woff", ".ttf", ".otf"],
        warnAtBytes: 288 * kibibyte,
        maximumBytes: 320 * kibibyte,
    },
];

function listFiles(directory: string): string[] {
    const files: string[] = [];

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const entryPath = join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...listFiles(entryPath));
            continue;
        }
        if (entry.isFile()) files.push(entryPath);
    }

    return files;
}

function sumBytes(paths: string[], extensions: string[]): number {
    const allowed = new Set(extensions);
    return paths.reduce((total, filePath) => {
        if (!allowed.has(extname(filePath))) return total;
        return total + statSync(filePath).size;
    }, 0);
}

function resolveBudgetStatus(
    bytes: number,
    budget: PerformanceBudget,
): PerformanceBudgetResult["status"] {
    if (bytes > budget.maximumBytes) return "fail";
    if (bytes > budget.warnAtBytes) return "warn";
    return "pass";
}

function formatKiB(bytes: number): string {
    return `${(bytes / kibibyte).toFixed(1)} KiB`;
}

export function measurePerformanceBudgets(
    directory = distDirectory,
    budgets = performanceBudgets,
): PerformanceBudgetResult[] {
    const files = listFiles(directory);
    return budgets.map((budget) => {
        const bytes = sumBytes(files, budget.extensions);
        return {
            ...budget,
            bytes,
            status: resolveBudgetStatus(bytes, budget),
        };
    });
}

export function formatPerformanceBudgetReport(
    results: PerformanceBudgetResult[],
): string {
    const lines = ["performance budgets"];
    for (const result of results) {
        const marker =
            result.status === "pass"
                ? "✓"
                : result.status === "warn"
                  ? "!"
                  : "✕";
        const overBy =
            result.status === "fail"
                ? ` (+${formatKiB(result.bytes - result.maximumBytes)})`
                : "";
        lines.push(
            `  ${marker} ${result.label.padEnd(5)} ${formatKiB(result.bytes)} / ${formatKiB(result.maximumBytes)}${overBy}`,
        );
    }
    return `${lines.join("\n")}\n`;
}

export function enforcePerformanceBudgets(
    directory = distDirectory,
    budgets = performanceBudgets,
): PerformanceBudgetResult[] {
    const results = measurePerformanceBudgets(directory, budgets);
    process.stdout.write(formatPerformanceBudgetReport(results));

    const failures = results.filter((result) => result.status === "fail");
    if (failures.length > 0) {
        const labels = failures.map((result) => result.label).join(", ");
        throw new Error(`Performance budget exceeded for ${labels}`);
    }

    return results;
}
