document.addEventListener("DOMContentLoaded", () =>
{
    const style = document.createElement("style");
    style.textContent = `
        .media-zoom-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            cursor: zoom-out !important;
            transition: opacity 0.25s cubic-bezier(0.25, 1, 0.75, 1);
        }

        .media-zoom-overlay.active {
            opacity: 1;
            pointer-events: all;
        }

        .media-zoom-overlay * {
            transform: scale(0.9);
            max-width: 90vw;
            max-height: 90vh;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
            border-radius: 10px;
            cursor: zoom-out !important;
            transition: transform 0.25s cubic-bezier(0.25, 1, 0.75, 1);
        }

        @media screen and (max-width: 600px) {
            .media-zoom-overlay * {
                max-width: 100vw;
                max-height: 100vh;
                border-radius: 0;
            }
        } 

        .media-zoom-overlay.active * {
            transform: scale(1);
        }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.className = "media-zoom-overlay";
    document.body.appendChild(overlay);

    const mediaElements = document.querySelectorAll("figure img.zoomable, figure video.zoomable");
    let activeElement = null;
    let currentScale = 1;

    mediaElements.forEach(element =>
    {
        element.style.cursor = "zoom-in";

        element.addEventListener("click", () => {
            if (!overlay.classList.contains("active")) {
                activeElement = element;
                const clone = element.cloneNode(true);
                overlay.innerHTML = "";
                overlay.appendChild(clone);

                document.body.style.overflow = "hidden";

                clone.getBoundingClientRect();

                overlay.classList.add("active");
            }
            else if (activeElement === element) {
                closeOverlay();
            }
        });
    });

    const closeOverlay = () =>
    {
        if (!overlay.classList.contains("active")) return;

        overlay.classList.remove("active");
        document.body.style.overflow = "";
        currentScale = 1;
        if (activeElement)
        {
            activeElement.style.cursor = "zoom-in";
            activeElement = null;
        }

        setTimeout(() => overlay.innerHTML = "", 250);
    };

    overlay.addEventListener("click", closeOverlay);

    overlay.addEventListener("wheel", eventObject =>
    {
    if (!overlay.classList.contains("active")) return;

    const mediaElement = overlay.querySelector("img, video");
    if (!mediaElement) return;

    eventObject.preventDefault();
    const delta = eventObject.deltaY < 0 ? 0.1 : -0.1;
    currentScale = Math.max(1, Math.min(3, currentScale + delta));
    mediaElement.style.transform = `scale(${currentScale})`;
    }, { passive: false });
    document.addEventListener("keydown", eventObject =>
    {
        if (eventObject.key === "Escape")
            closeOverlay();
    });
});
