import { useRenderContext } from "../../context/render-context.tsx";
import { Island } from "../../islands/island.tsx";

export function TableOfContents() {
    const { headings } = useRenderContext();
    if (headings.length === 0) {
        return null;
    }

    return (
        <Island
            name="TableOfContents"
            props={{ headings }}
            hydrate="interaction"
        />
    );
}
