import type { ReactNode } from "preact/compat";
import styles from "./callout.module.css";

type CalloutType = "note" | "warning" | "tip";

const calloutLabels: Record<CalloutType, string> = {
    note: "Note",
    warning: "Warning",
    tip: "Tip",
};

const variantClasses: Record<CalloutType, string> = {
    note: "",
    warning: styles.warning,
    tip: styles.tip,
};

interface CalloutProps {
    type?: CalloutType;
    children?: ReactNode;
}

export function Callout({ type = "note", children }: CalloutProps) {
    const variant = variantClasses[type];
    return (
        <aside
            className={`${styles.root}${variant ? ` ${variant}` : ""} card semi-bleed`}
            aria-label={`${calloutLabels[type]} callout`}
        >
            <p className={`${styles.label} label`}>{calloutLabels[type]}</p>
            <div className="body-md">{children}</div>
        </aside>
    );
}
