function isInsideIsland(node: Element | null): boolean {
    return Boolean(node?.closest("[data-island]"));
}

export function bootEnhancements() {
    if (!document.body) return;

    const headerSection = document.querySelector<HTMLElement>(
        ".running-header__section",
    );
    if (headerSection) {
        const sections = Array.from(
            document.querySelectorAll<HTMLElement>(
                "article section[data-title], article h2[id]",
            ),
        ).filter((element) => !isInsideIsland(element));

        if (sections.length) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const element = entry.target as HTMLElement;
                            headerSection.textContent =
                                element.dataset.title ||
                                element.textContent?.trim().slice(0, 60) ||
                                "";
                        }
                    });
                },
                { rootMargin: "-10% 0px -80% 0px" },
            );

            sections.forEach((section) => observer.observe(section));
        }
    }

    let ticking = false;
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const progress = Math.min(scrollY / 1000, 1);
                const weight = Math.round(300 + progress * 100);
                document.documentElement.style.setProperty(
                    "--wght",
                    String(weight),
                );
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });

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
                note.className = "margin-note";
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
            inline.className = "fn-inline";
            inline.id = `inline-${targetId.replace(/^#/, "")}`;
            inline.textContent = footnote.textContent || "";
            ref.insertAdjacentElement("afterend", inline);
        }

        inline.classList.toggle("is-open");
    });

    const seenKey = "ps_arrived";
    const arrival = document.querySelector(".page-arrival");
    if (!(arrival instanceof HTMLElement)) {
        return;
    }

    if (!sessionStorage.getItem(seenKey)) {
        sessionStorage.setItem(seenKey, "1");
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                arrival.classList.add("is-visible");
            });
        });
        return;
    }

    arrival.classList.add("is-visible");
}
