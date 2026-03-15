import { readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { siteConfig } from "../../site.config.ts";
import { distDirectory } from "./shared/paths.ts";

export interface PerformanceBudget {
    label: string;
    extensions: readonly string[];
    warnAtBytes: number;
    maximumBytes: number;
}

export interface PerformanceBudgetResult extends PerformanceBudget {
    bytes: number;
    status: "pass" | "warn" | "fail";
}

const kibibyte = 1024;

export const performanceBudgets = siteConfig.performance
    .budgets satisfies readonly PerformanceBudget[];

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

function sumBytes(paths: string[], extensions: readonly string[]): number {
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
    budgets: readonly PerformanceBudget[] = performanceBudgets,
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
    budgets: readonly PerformanceBudget[] = performanceBudgets,
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
