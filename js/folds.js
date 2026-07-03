document.addEventListener("DOMContentLoaded", () => {
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
