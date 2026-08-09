const PRISM_BASE_URL = "https://cdn.jsdelivr.net/npm/prismjs";
const COLLAPSED_CODE_BLOCK_HEIGHT = 300;
const CODE_BLOCK_STYLES = `
.code-snippet {
    background: var(--background-color-light) !important;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    padding: 0.2rem 0.4rem;
    border-radius: 1.5rem;
}

.code-block {
    position: relative;
    margin: 1rem 0 !important;
    padding: 0;
    width: 100%;
    border-radius: 1.5rem;
}

.code-block-toolbar {
    position: sticky;
    top: 0;
    right: 0;
    height: 0px;
    width: 100%;
    z-index: 10;
}

.code-block-toolbar-buttons {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.5rem;
    height: 2rem;
    z-index: 11;
}

.code-block-button .tooltip {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: black;
    color: var(--text-color-light);
    padding: 0.4rem 0.6rem;
    border-radius: 1.5rem;
    font-size: 0.9em;
    white-space: nowrap;
    pointer-events: none;
    transition: opacity 0.2s, visibility 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.code-block-button:hover .tooltip {
    visibility: visible;
    opacity: 1;
}

.code-block pre {
    position: relative;
    background: var(--background-color-light) !important;
    white-space: pre;
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    padding: 1rem !important;
    margin: 0 !important;
    border-radius: 1.5rem;
}

.code-block code {
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 1em;
    padding: 0 !important;
    margin: 0 !important;
    text-align: left;
    background: none;
    padding: 0;
    color: #ccc;
    background: none;
    white-space: pre;
    overflow-x: scroll;
    border-radius: 1.5rem;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
}

.code-block code .input {
    color: #8ef;
}

.code-block.wrapped pre code {
    white-space: pre-wrap !important;
}

.code-block.collapsible pre {
    transition: max-height 0.35s cubic-bezier(0.25, 1, 0.5, 1);
    max-height: 300px;
    overflow-y: hidden;
}

.code-block.collapsible::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background: linear-gradient(0deg, var(--background-color-light), transparent);
    border-radius: 1.5rem;
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}

.code-block.collapsible.expanded::after {
    opacity: 0;
}

.code-block-button {
    position: relative;
    background: var(--background-color-light);
    color: var(--text-color-lighter);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 1.5rem;
    border: none;
    font-size: 1em;
    transition: background 0.2s, color 0.2s;
}

.code-block-button>i {
    transition: scale 100ms ease;
}

.code-block-button:active>i {
    scale: 0.9;
}

.code-block-toggle-icon {
    transform: rotate(0deg);
}

.code-block.expanded .code-block-toggle-icon {
    transform: rotate(180deg);
}

.code-block-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-color);
}

.code-block pre[data-header] {
    position: relative;
}

.code-block pre[data-header] {
    padding-top: 2rem !important;
}

.code-block pre[data-header]::before {
    content: attr(data-header);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-weight: 400;
    text-align: left;
    color: rgb(255, 255, 255, 0.4);
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace !important;
    font-family: var(--font-family);
    user-select: none;
}
`;

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

    const style = document.createElement("style");
    style.textContent = CODE_BLOCK_STYLES;
    document.head.appendChild(style);

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
