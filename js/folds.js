document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style");
    style.textContent = `
        .fold {
            width: 100%;
            margin: 1rem 0;
            overflow: hidden;
            background: var(--background-color-light);
            border-radius: 1.5rem;
        }

        .fold-toggle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            width: 100%;
            padding: 1rem;
            color: var(--text-color);
            font: inherit;
            font-weight: 700;
            text-align: left;
            cursor: pointer;
            background: transparent;
            border: 0;
        }

        .fold-toggle:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .fold-chevron {
            flex: 0 0 auto;
            color: var(--text-color-light);
            transform: rotate(0deg);
        }

        .fold.expanded .fold-chevron {
            transform: rotate(180deg);
        }

        .fold-content {
            display: grid;
            grid-template-rows: 0fr;
            visibility: hidden;
            transition:
                grid-template-rows 0.35s cubic-bezier(0.25, 1, 0.5, 1),
                visibility 0s 0.35s;
        }

        .fold.expanded .fold-content {
            grid-template-rows: 1fr;
            visibility: visible;
            transition:
                grid-template-rows 0.35s cubic-bezier(0.25, 1, 0.5, 1),
                visibility 0s;
        }

        .fold-content-inner {
            min-height: 0;
            overflow: hidden;
        }

        .fold-content-inner>* {
            margin-right: 1rem;
            margin-left: 1rem;
        }

        .fold-content-inner> :first-child {
            margin-top: 0;
            padding-top: 0.5rem;
        }

        .fold-content-inner> :last-child {
            margin-bottom: 0;
            padding-bottom: 1rem;
        }
`;
    document.head.appendChild(style);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    document.querySelectorAll(".fold").forEach((fold, index) => {
        const title = fold.dataset.title?.trim() || "Details";
        const startsExpanded = fold.classList.contains("expanded");
        const contentId = fold.id
            ? `${fold.id}-content`
            : `fold-content-${index + 1}`;

        const contentInner = document.createElement("div");
        contentInner.className = "fold-content-inner";
        contentInner.append(...fold.childNodes);

        const content = document.createElement("div");
        content.className = "fold-content";
        content.id = contentId;
        content.append(contentInner);

        const toggle = document.createElement("button");
        toggle.className = "fold-toggle";
        toggle.type = "button";
        toggle.setAttribute("aria-controls", contentId);
        toggle.setAttribute("aria-expanded", startsExpanded.toString());

        const titleElement = document.createElement("span");
        titleElement.className = "fold-title";
        titleElement.textContent = title;

        const icon = document.createElement("i");
        icon.className = "fa-solid fa-chevron-down fold-chevron";
        icon.setAttribute("aria-hidden", "true");

        toggle.append(titleElement, icon);
        fold.append(toggle, content);
        fold.classList.add("fold-ready");

        toggle.addEventListener("click", () => {
            const isExpanded = fold.classList.toggle("expanded");
            toggle.setAttribute("aria-expanded", isExpanded.toString());

            if (reduceMotion.matches) {
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
        });
    });
});
