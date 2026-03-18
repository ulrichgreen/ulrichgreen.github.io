import type { ReactNode } from "preact/compat";

type CalloutType = "note" | "warning" | "tip";

const calloutLabels: Record<CalloutType, string> = {
    note: "Note",
    warning: "Warning",
    tip: "Tip",
};

interface CalloutProps {
    type?: CalloutType;
    children?: ReactNode;
}

export function Callout({ type = "note", children }: CalloutProps) {
    return (
        <aside
            className={`callout callout--${type} card semi-bleed`}
            aria-label={`${calloutLabels[type]} callout`}
        >
            <p className="callout__label label">{calloutLabels[type]}</p>
            <div className="callout__body">{children}</div>
        </aside>
    );
}
