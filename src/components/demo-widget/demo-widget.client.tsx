import { useState } from "preact/hooks";

export interface DemoWidgetProps {
    prompt?: string;
    initialCount?: number;
}

export function DemoWidget({
    prompt = "Count the cost before you add capability.",
    initialCount = 0,
}: DemoWidgetProps) {
    const [count, setCount] = useState(initialCount);

    return (
        <aside className="demo-widget">
            <p className="demo-widget__prompt body-sm">{prompt}</p>
            <div className="demo-widget__controls">
                <button
                    className="demo-widget__button label"
                    type="button"
                    onClick={() => setCount((value) => value - 1)}
                >
                    Less
                </button>
                <output
                    className="demo-widget__value heading-lg mono"
                    aria-live="polite"
                >
                    {count}
                </output>
                <button
                    className="demo-widget__button label"
                    type="button"
                    onClick={() => setCount((value) => value + 1)}
                >
                    More
                </button>
            </div>
        </aside>
    );
}
