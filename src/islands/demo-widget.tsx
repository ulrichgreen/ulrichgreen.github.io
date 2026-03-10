import { useState } from "react";
import { Island } from "./island.tsx";

export interface DemoWidgetProps {
    prompt?: string;
    initialCount?: number;
}

export function DemoWidgetClient({
    prompt = "Count the cost before you add capability.",
    initialCount = 0,
}: DemoWidgetProps) {
    const [count, setCount] = useState(initialCount);

    return (
        <aside className="demo-widget">
            <p className="demo-widget__prompt">{prompt}</p>
            <div className="demo-widget__controls">
                <button
                    className="demo-widget__button"
                    type="button"
                    onClick={() => setCount((value) => value - 1)}
                >
                    Less
                </button>
                <output className="demo-widget__value" aria-live="polite">
                    {count}
                </output>
                <button
                    className="demo-widget__button"
                    type="button"
                    onClick={() => setCount((value) => value + 1)}
                >
                    More
                </button>
            </div>
        </aside>
    );
}

export function DemoWidget(props: DemoWidgetProps) {
    return (
        <Island name="DemoWidget" component={DemoWidgetClient} props={props} />
    );
}
