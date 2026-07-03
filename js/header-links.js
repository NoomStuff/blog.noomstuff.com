const desktopViewport = window.matchMedia("(min-width: 769px)");

const copyText = async (value) => {
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

    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return;
    }

    throw new Error("The browser rejected the copy command.");
};

document.addEventListener("DOMContentLoaded", () => {
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
