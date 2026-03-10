import { bootEnhancements } from "./enhancements.ts";

function ready(callback: () => void) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback, { once: true });
        return;
    }

    callback();
}

ready(bootEnhancements);
