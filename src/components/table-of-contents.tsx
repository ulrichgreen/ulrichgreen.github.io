import { useRenderContext } from "../context/render-context.tsx";
import { Island } from "../islands/island.tsx";
import { TableOfContentsClient } from "../islands/table-of-contents.tsx";

export function TableOfContents() {
    const { headings } = useRenderContext();
    if (headings.length === 0) {
        return null;
    }

    return (
        <Island
            name="TableOfContents"
            component={TableOfContentsClient}
            props={{ headings }}
            hydrate="interaction"
        />
    );
}
