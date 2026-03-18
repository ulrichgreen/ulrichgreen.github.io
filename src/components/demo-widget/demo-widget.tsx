import { Island } from "../../islands/island.tsx";
import type { DemoWidgetProps } from "./demo-widget.client.tsx";

export type { DemoWidgetProps };

export function DemoWidget(props: DemoWidgetProps) {
    return <Island name="DemoWidget" props={props} />;
}
