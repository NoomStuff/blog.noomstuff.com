const desktopViewport = window.matchMedia("(min-width: 769px)");

const HEADER_LINK_STYLES = `
.post-content h2 i.header-link-copy,
.post-content h3 i.header-link-copy {
    cursor: pointer;
    transition: opacity 150ms ease, scale 200ms cubic-bezier(0.1, 2, 0.5, 1);
}

.post-content h2 i.header-link-copy:hover,
.post-content h2 i.header-link-copy:focus-visible,
.post-content h3 i.header-link-copy:hover,
.post-content h3 i.header-link-copy:focus-visible {
    opacity: 0.8;
    scale: 1.2;
}

.post-content h2 i.header-link-copy.copied,
.post-content h3 i.header-link-copy.copied {
    opacity: 1;
    scale: 1.15;
}

.header-link-copy:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 1.5rem;
}

.notice {
    position: absolute;
    top: 95%;
    left: 50%;
    padding: 0 0.5rem;
    border-radius: 1.5rem;
    background-color: black;
    color: white;
    font-size: 1rem;
    font-family: var(--font-family);
    font-style: normal;
    font-weight: 300;
    line-height: 1.5;
    text-wrap: nowrap;
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    transform: translate(-50%, 0.25rem);
    transition: opacity 150ms ease, transform 150ms ease;
}

.notice::before {
    content: '';
    position: absolute;
    background-color: black;
    height: 10px;
    width: 10px;
    top: -5px;
    left: calc(50% - 5px);
    rotate: 45deg;
}

.notice.visible {
    opacity: 1;
    transform: translate(-50%, 0.5rem);
}

@media screen and (max-width: 768px) {
    .header-link-copy,
    .header-link-copy .notice {
        display: none;
    }
}
`;

const copyText = async (value) => {
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

    if (copied) {
        return;
    }

    throw new Error("The browser rejected the copy command.");
};

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style");
    style.textContent = HEADER_LINK_STYLES;
    document.head.appendChild(style);

    const headings = document.querySelectorAll(
        ".post-content h2, .post-content h3",
    );
    const usedSlugs = new Set();

    const createSlug = (title) => {
        const baseSlug = title
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "section";

        let slug = baseSlug;
        let suffix = 2;

        while (usedSlugs.has(slug) || document.getElementById(slug)) {
            slug = `${baseSlug}-${suffix}`;
            suffix += 1;
        }

        usedSlugs.add(slug);
        return slug;
    };

    headings.forEach((heading) => {
        if (!(heading instanceof HTMLHeadingElement)) {
            return;
        }

        const linkIcon = heading.querySelector(":scope > i");
        const title = Array.from(heading.childNodes)
            .filter((node) => node !== linkIcon)
            .map((node) => node.textContent ?? "")
            .join("")
            .trim();
        const slug = heading.id || createSlug(title);

        usedSlugs.add(slug);
        heading.id = slug;
        heading.setAttribute("aria-label", title);

        if (!(linkIcon instanceof HTMLElement)) {
            return;
        }

        linkIcon.classList.add("header-link-copy");
        linkIcon.setAttribute("role", "button");
        linkIcon.setAttribute("tabindex", "0");
        linkIcon.setAttribute("aria-label", `Copy link to ${title}`);
        linkIcon.removeAttribute("aria-hidden");

        const feedback = document.createElement("span");
        feedback.className = "notice";
        feedback.setAttribute("role", "status");
        feedback.setAttribute("aria-live", "polite");
        linkIcon.appendChild(feedback);

        let feedbackTimeout = 0;

        const copyHeaderLink = async () => {
            if (!desktopViewport.matches) {
                return;
            }

            const url = new URL(window.location.href);
            url.hash = slug;
            window.history.replaceState(null, "", url);

            try {
                await copyText(url.href);
                linkIcon.classList.add("copied");
                feedback.classList.add("visible");
                feedback.textContent = "Copied!";
                window.clearTimeout(feedbackTimeout);
                feedbackTimeout = window.setTimeout(() => {
                    linkIcon.classList.remove("copied");
                    feedback.classList.remove("visible");
                    feedback.textContent = "";
                }, 1200);
            } catch (error) {
                console.error("Unable to copy header link.", error);
            }
        };

        linkIcon.addEventListener("click", copyHeaderLink);
        linkIcon.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            event.preventDefault();
            void copyHeaderLink();
        });
    });
});
