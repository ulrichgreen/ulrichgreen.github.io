function isInsideIsland(node: Element | null): boolean {
    return Boolean(node?.closest("[data-island]"));
}

function bootCodeBlocks() {
    const figures = Array.from(
        document.querySelectorAll<HTMLElement>(
            "[data-rehype-pretty-code-figure], .code-block",
        ),
    ).filter((figure) => !isInsideIsland(figure));

    for (const figure of figures) {
        if (figure.dataset.codeBlockEnhanced === "true") continue;

        const pre = figure.querySelector<HTMLPreElement>("pre");
        const code = figure.querySelector<HTMLElement>("code");

        if (!pre || !code) continue;

        figure.dataset.codeBlockEnhanced = "true";

        const language =
            pre.dataset.language || figure.dataset.language || "text";
        figure.dataset.language = language;

        let toolbar = figure.querySelector<HTMLElement>(".code-block__toolbar");
        if (!toolbar) continue;

        let copyButton =
            toolbar.querySelector<HTMLButtonElement>(".code-block__copy");
        if (!copyButton) {
            copyButton = document.createElement("button");
            copyButton.type = "button";
            copyButton.className = "code-block__copy";
            copyButton.textContent = "Copy";
            toolbar.append(copyButton);
        }

        copyButton.setAttribute(
            "aria-label",
            `Copy ${language} code to clipboard`,
        );

        if (!navigator.clipboard?.writeText) {
            copyButton.disabled = true;
            continue;
        }

        copyButton.addEventListener("click", async () => {
            const source = code.textContent?.replace(/\n$/, "") || "";
            if (!source) return;

            try {
                await navigator.clipboard.writeText(source);
                copyButton.dataset.state = "copied";
                copyButton.textContent = "Copied";

                window.setTimeout(() => {
                    copyButton.dataset.state = "idle";
                    copyButton.textContent = "Copy";
                }, 2200);
            } catch {
                copyButton.dataset.state = "error";
                copyButton.textContent = "Failed";

                window.setTimeout(() => {
                    copyButton.dataset.state = "idle";
                    copyButton.textContent = "Copy";
                }, 2200);
            }
        });
    }
}

function bootReadingProgress() {
    const progress = document.getElementById("progress");
    if (!(progress instanceof HTMLElement)) return;
    let rafId = 0;

    const syncProgress = () => {
        const { documentElement, body } = document;
        const scrollTop = documentElement.scrollTop || body.scrollTop;
        const scrollHeight =
            documentElement.scrollHeight || body.scrollHeight || 0;
        const clientHeight = documentElement.clientHeight || window.innerHeight;
        const maxScroll = Math.max(scrollHeight - clientHeight, 0);
        const ratio = maxScroll === 0 ? 0 : scrollTop / maxScroll;
        progress.style.width = `${Math.min(Math.max(ratio, 0), 1) * 100}%`;
        rafId = 0;
    };

    const requestSync = () => {
        if (rafId) return;
        rafId = window.requestAnimationFrame(syncProgress);
    };

    syncProgress();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);
}

function bootHeadingReveal() {
    const headings = Array.from(
        document.querySelectorAll<HTMLElement>(
            "#main-content h2, #main-content h3",
        ),
    ).filter((heading) => !isInsideIsland(heading));

    if (headings.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    );

    if (prefersReducedMotion.matches) return;

    for (const heading of headings) {
        heading.classList.add("scroll-reveal-heading");
    }

    if (!("IntersectionObserver" in window)) {
        for (const heading of headings) {
            heading.classList.add("is-visible");
        }
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;

                const heading = entry.target;
                if (!(heading instanceof HTMLElement)) continue;

                heading.classList.add("is-visible");
                observer.unobserve(heading);
            }
        },
        {
            threshold: 0.18,
            rootMargin: "0px 0px -8% 0px",
        },
    );

    for (const heading of headings) {
        observer.observe(heading);
    }
}

export function bootEnhancements() {
    if (!document.body) return;
    if (document.body.dataset.enhancementsBooted === "true") return;
    document.body.dataset.enhancementsBooted = "true";

    for (const reference of document.querySelectorAll<HTMLElement>(".fn-ref")) {
        reference.classList.add("caption");
    }

    bootCodeBlocks();
    bootReadingProgress();
    bootHeadingReveal();

    const hasWideMargin = window.matchMedia("(min-width: 900px)");

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element) || isInsideIsland(target)) return;

        const ref = target.closest<HTMLAnchorElement>(".fn-ref");
        if (!ref) return;

        event.preventDefault();

        const targetId = ref.getAttribute("href") || ref.dataset.fn;
        if (!targetId) return;

        const footnote = document.getElementById(targetId.replace(/^#/, ""));
        if (!footnote) return;

        if (hasWideMargin.matches) {
            let note = document.querySelector<HTMLElement>(
                `.margin-note[data-for="${targetId.replace(/^#/, "")}"]`,
            );
            if (!note) {
                note = document.createElement("aside");
                note.className = "margin-note caption";
                note.dataset.for = targetId.replace(/^#/, "");
                note.dataset.ref = ref.textContent?.trim() || "";
                note.textContent = footnote.textContent || "";

                const article = ref.closest("article");
                if (article) {
                    article.style.position = "relative";
                    article.appendChild(note);
                }
            }

            const article = ref.closest("article");
            if (!article || !note) return;

            const refRect = ref.getBoundingClientRect();
            const articleRect = article.getBoundingClientRect();
            note.style.top = `${refRect.top - articleRect.top}px`;
            return;
        }

        let inline = document.getElementById(
            `inline-${targetId.replace(/^#/, "")}`,
        );
        if (!inline) {
            inline = document.createElement("div");
            inline.className = "fn-inline caption";
            inline.id = `inline-${targetId.replace(/^#/, "")}`;
            inline.textContent = footnote.textContent || "";
            ref.insertAdjacentElement("afterend", inline);
        }

        inline.classList.toggle("is-open");
    });
}
