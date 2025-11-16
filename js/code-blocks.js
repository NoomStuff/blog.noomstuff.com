document.addEventListener("DOMContentLoaded", () => {
    function loadCSS(href) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    }

    function loadJS(src, isModule = false) {
        return new Promise(resolve => {
            const script = document.createElement("script");
            script.src = src;
            if (isModule) script.type = "module";
            script.onload = resolve;
            document.body.appendChild(script);
        });
    }

    loadCSS("https://cdn.jsdelivr.net/npm/prismjs/themes/prism-tomorrow.css");

    Promise.all([
        loadJS("https://cdn.jsdelivr.net/npm/prismjs/prism.js"),

        loadJS("https://cdn.jsdelivr.net/npm/prismjs/components/prism-markdown.min.js"),
        loadJS("https://cdn.jsdelivr.net/npm/prismjs/components/prism-markup.min.js"),
        loadJS("https://cdn.jsdelivr.net/npm/prismjs/components/prism-css.min.js"),
        loadJS("https://cdn.jsdelivr.net/npm/prismjs/components/prism-javascript.min.js"),
        loadJS("https://cdn.jsdelivr.net/npm/prismjs/components/prism-python.min.js"),
        loadJS("https://cdn.jsdelivr.net/npm/prismjs/components/prism-csharp.min.js"),
    ]).then(() => {
        document.querySelectorAll(".code-block").forEach(codeBlock => {
            const collapsedHeight = 300;
            const pre = codeBlock.querySelector("pre");
            const code = pre ? pre.querySelector("code") : null;

            // Collapsible logic
            if (codeBlock.classList.contains("collapsible") && pre) {
                pre.style.maxHeight = codeBlock.classList.contains("expanded") ? (pre.scrollHeight + "px") : (collapsedHeight + "px");
                pre.style.overflowY = codeBlock.classList.contains("expanded") ? "auto" : "hidden";
            }

            let toolbar = codeBlock.querySelector(".code-block-toolbar");
            if (!toolbar) {
                toolbar = document.createElement("div");
                toolbar.className = "code-block-toolbar";
                codeBlock.prepend(toolbar);

                toolbarButtons = document.createElement("div");
                toolbarButtons.className = "code-block-toolbar-buttons";
                toolbar.appendChild(toolbarButtons);
            }

            // Wrap button
            if (codeBlock.classList.contains("wrappable")) {
                const wrapButton = document.createElement("button");
                wrapButton.className = "code-block-button";
                wrapButton.style.cursor = "pointer";

                let isWrapped = codeBlock.classList.contains("wrapped");
                wrapButton.innerHTML = isWrapped
                    ? "<i class='fa-solid fa-align-justify'></i> <span class='tooltip'>Unwrap Lines</span>"
                    : "<i class='fa-solid fa-align-left'></i> <span class='tooltip'>Wrap Lines</span>";

                wrapButton.addEventListener("click", (e) => {
                    e.stopPropagation();
                    isWrapped = !isWrapped;
                    if (isWrapped) {
                        codeBlock.classList.add("wrapped");
                        wrapButton.innerHTML = "<i class='fa-solid fa-align-justify'></i> <span class='tooltip'>Unwrap Lines</span>";
                    } else {
                        codeBlock.classList.remove("wrapped");
                        wrapButton.innerHTML = "<i class='fa-solid fa-align-left'></i> <span class='tooltip'>Wrap Lines</span>";
                    }
                });
                toolbarButtons.appendChild(wrapButton);
            }

            // Copy button
            if (codeBlock.classList.contains("copyable")) {
                const copyButton = document.createElement("button");
                copyButton.className = "code-block-button";
                copyButton.style.cursor = "pointer";

                copyButton.innerHTML = "<i class='fa-solid fa-copy'></i> <span class='tooltip'>Copy Code</span>";
                copyButton.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (code) {
                        const text = code.innerText;
                        navigator.clipboard.writeText(text).then(() => {
                            copyButton.innerHTML = "<i class='fa-solid fa-check'></i> <span class='tooltip'>Copied!</span>";
                            setTimeout(() => {
                                copyButton.innerHTML = "<i class='fa-solid fa-copy'></i> <span class='tooltip'>Copy Code</span>";
                            }, 1200);
                        });
                    }
                });
                toolbarButtons.appendChild(copyButton);
            }

            // Expand/collapse button
            if (codeBlock.classList.contains("collapsible")) {
                const toggleButton = document.createElement("button");
                toggleButton.className = "code-block-button";
                toggleButton.style.cursor = "pointer";

                let isExpanded = codeBlock.classList.contains("expanded");
                toggleButton.innerHTML = isExpanded
                    ? "<i class='fa-solid fa-chevron-up'></i> <span class='tooltip'>Collapse Block</span>"
                    : "<i class='fa-solid fa-chevron-down'></i> <span class='tooltip'>Expand Block</span>";

                toggleButton.addEventListener("click", (e) => {
                    e.stopPropagation();
                    isExpanded = !isExpanded;
                    if (isExpanded) {
                        if (pre) {
                            pre.style.maxHeight = pre.scrollHeight + "px";
                            pre.style.overflowY = "auto";
                        }
                        codeBlock.classList.add("expanded");
                        toggleButton.innerHTML = "<i class='fa-solid fa-chevron-up'></i> <span class='tooltip'>Collapse Block</span>";
                    } else {
                        if (pre) {
                            pre.style.maxHeight = collapsedHeight + "px";
                            pre.style.overflowY = "hidden";
                        }
                        codeBlock.classList.remove("expanded");
                        toggleButton.innerHTML = "<i class='fa-solid fa-chevron-down'></i> <span class='tooltip'>Expand Block</span>";
                    }
                });
                toolbarButtons.appendChild(toggleButton);
            }
        });

        if (window.Prism) {
            Prism.highlightAll();
        }
    });
});
