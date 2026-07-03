const PRISM_BASE_URL = "https://cdn.jsdelivr.net/npm/prismjs";
const COLLAPSED_CODE_BLOCK_HEIGHT = 300;

const loadStylesheet = (href) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
};

const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
});

const copyCode = async (value) => {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(value);
            return;
        } catch {
            // Fall through to the legacy copy method.
        }
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    textarea.remove();

    if (!copied) {
        throw new Error("The browser rejected the copy command.");
    }
};

const createToolbarButton = (iconClass, tooltipText, label) => {
    const button = document.createElement("button");
    button.className = "code-block-button";
    button.type = "button";
    button.setAttribute("aria-label", label);

    const icon = document.createElement("i");
    icon.className = iconClass;
    icon.setAttribute("aria-hidden", "true");

    const tooltip = document.createElement("span");
    tooltip.className = "tooltip";
    tooltip.textContent = tooltipText;

    button.append(icon, tooltip);
    return { button, icon, tooltip };
};

const animateChevron = (icon, isExpanded) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    icon.animate(
        isExpanded
            ? [
                { transform: "rotate(0deg)" },
                { transform: "rotate(202deg)", offset: 0.55 },
                { transform: "rotate(172deg)", offset: 0.78 },
                { transform: "rotate(184deg)", offset: 0.9 },
                { transform: "rotate(180deg)" },
            ]
            : [
                { transform: "rotate(180deg)" },
                { transform: "rotate(-22deg)", offset: 0.55 },
                { transform: "rotate(8deg)", offset: 0.78 },
                { transform: "rotate(-4deg)", offset: 0.9 },
                { transform: "rotate(0deg)" },
            ],
        {
            duration: 560,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
    );
};

const initializeCodeBlock = (codeBlock) => {
    const pre = codeBlock.querySelector("pre");
    const code = pre?.querySelector("code");
    const toolbar = document.createElement("div");
    const toolbarButtons = document.createElement("div");

    toolbar.className = "code-block-toolbar";
    toolbarButtons.className = "code-block-toolbar-buttons";
    toolbar.appendChild(toolbarButtons);
    codeBlock.prepend(toolbar);

    if (codeBlock.classList.contains("collapsible") && pre) {
        const startsExpanded = codeBlock.classList.contains("expanded");
        pre.style.maxHeight = startsExpanded
            ? `${pre.scrollHeight}px`
            : `${COLLAPSED_CODE_BLOCK_HEIGHT}px`;
        pre.style.overflowY = startsExpanded ? "auto" : "hidden";
    }

    if (codeBlock.classList.contains("wrappable")) {
        let isWrapped = codeBlock.classList.contains("wrapped");
        const wrapControl = createToolbarButton(
            isWrapped ? "fa-solid fa-align-justify" : "fa-solid fa-align-left",
            isWrapped ? "Unwrap Lines" : "Wrap Lines",
            isWrapped ? "Unwrap lines" : "Wrap lines",
        );

        wrapControl.button.addEventListener("click", (event) => {
            event.stopPropagation();
            isWrapped = !isWrapped;
            codeBlock.classList.toggle("wrapped", isWrapped);
            wrapControl.icon.className = isWrapped
                ? "fa-solid fa-align-justify"
                : "fa-solid fa-align-left";
            wrapControl.tooltip.textContent = isWrapped
                ? "Unwrap Lines"
                : "Wrap Lines";
            wrapControl.button.setAttribute(
                "aria-label",
                isWrapped ? "Unwrap lines" : "Wrap lines",
            );
        });

        toolbarButtons.appendChild(wrapControl.button);
    }

    if (codeBlock.classList.contains("copyable") && code) {
        const copyControl = createToolbarButton(
            "fa-solid fa-copy",
            "Copy Code",
            "Copy code",
        );
        let feedbackTimeout = 0;

        copyControl.button.addEventListener("click", async (event) => {
            event.stopPropagation();

            try {
                await copyCode(code.innerText);
                copyControl.icon.className = "fa-solid fa-check";
                copyControl.tooltip.textContent = "Copied!";
                copyControl.button.setAttribute("aria-label", "Copied");
                window.clearTimeout(feedbackTimeout);
                feedbackTimeout = window.setTimeout(() => {
                    copyControl.icon.className = "fa-solid fa-copy";
                    copyControl.tooltip.textContent = "Copy Code";
                    copyControl.button.setAttribute("aria-label", "Copy code");
                }, 1200);
            } catch (error) {
                console.error("Unable to copy code.", error);
            }
        });

        toolbarButtons.appendChild(copyControl.button);
    }

    if (codeBlock.classList.contains("collapsible") && pre) {
        let isExpanded = codeBlock.classList.contains("expanded");
        const toggleControl = createToolbarButton(
            "fa-solid fa-chevron-down code-block-toggle-icon",
            isExpanded ? "Collapse Block" : "Expand Block",
            isExpanded ? "Collapse code block" : "Expand code block",
        );

        toggleControl.button.setAttribute("aria-expanded", isExpanded.toString());
        toggleControl.button.addEventListener("click", (event) => {
            event.stopPropagation();
            isExpanded = !isExpanded;
            codeBlock.classList.toggle("expanded", isExpanded);
            toggleControl.button.setAttribute(
                "aria-expanded",
                isExpanded.toString(),
            );
            toggleControl.button.setAttribute(
                "aria-label",
                isExpanded ? "Collapse code block" : "Expand code block",
            );
            toggleControl.tooltip.textContent = isExpanded
                ? "Collapse Block"
                : "Expand Block";

            pre.style.overflowY = "hidden";
            pre.style.maxHeight = isExpanded
                ? `${pre.scrollHeight}px`
                : `${COLLAPSED_CODE_BLOCK_HEIGHT}px`;
            animateChevron(toggleControl.icon, isExpanded);
        });

        pre.addEventListener("transitionend", (event) => {
            if (event.propertyName === "max-height" && isExpanded) {
                pre.style.overflowY = "auto";
            }
        });

        toolbarButtons.appendChild(toggleControl.button);
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    const codeBlocks = document.querySelectorAll(".code-block");

    if (codeBlocks.length === 0) {
        return;
    }

    codeBlocks.forEach(initializeCodeBlock);
    loadStylesheet(`${PRISM_BASE_URL}/themes/prism-tomorrow.css`);

    try {
        await loadScript(`${PRISM_BASE_URL}/prism.js`);
        await Promise.all([
            loadScript(`${PRISM_BASE_URL}/components/prism-markdown.min.js`),
            loadScript(`${PRISM_BASE_URL}/components/prism-python.min.js`),
            loadScript(`${PRISM_BASE_URL}/components/prism-csharp.min.js`),
        ]);
    } catch (error) {
        console.error("Unable to load syntax highlighting.", error);
    }

    window.Prism?.highlightAll();
});
