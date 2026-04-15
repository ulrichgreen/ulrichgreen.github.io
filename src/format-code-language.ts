const knownLabels: Record<string, string> = {
    css: "CSS",
    html: "HTML",
    javascript: "JavaScript",
    js: "JavaScript",
    json: "JSON",
    jsx: "JSX",
    md: "Markdown",
    mdx: "MDX",
    shell: "Shell",
    text: "Text",
    ts: "TypeScript",
    tsx: "TSX",
    typescript: "TypeScript",
    xml: "XML",
    yaml: "YAML",
    yml: "YAML",
};

export function formatCodeLanguage(value?: string): string {
    const normalized = (value || "").trim().toLowerCase();
    if (!normalized) return "Text";

    if (knownLabels[normalized]) return knownLabels[normalized];

    return normalized
        .split(/[-_]/g)
        .filter(Boolean)
        .map((segment) => segment.slice(0, 1).toUpperCase() + segment.slice(1))
        .join(" ");
}
