document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style");
    style.textContent = `
        ::-webkit-scrollbar {
            display: none;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }

        #progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            height: 4px;
            opacity: 0.75;
            width: 0;
            background: linear-gradient(90deg, var(--primary-color-light), var(--secondary-color-light));
            z-index: 9999;
            backdrop-filter: blur(10px);
            border-bottom-right-radius: 4px;
            transition: width 0.25s cubic-bezier(0.2, 0.8, 0.3, 1.4);
        }
    `;
    document.head.appendChild(style);

    const bar = document.createElement("div");
    bar.id = "progress-bar";
    document.body.appendChild(bar);

    const banner = document.getElementById("banner");
    const postEnd = document.getElementById("post-end");

    let startOffset = 0;
    let endOffset = 0;

    if (banner) startOffset = banner.offsetHeight;
    if (postEnd) endOffset = postEnd.offsetHeight;


    function updateProgress() {
        const scrollDistance = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = Math.max(((scrollDistance - startOffset) / (documentHeight - startOffset - endOffset)), 0) * 100;
        bar.style.width = scrollPercentage + "%";
    }

    window.addEventListener("scroll", updateProgress);
    window.addEventListener("resize", updateProgress);

    updateProgress();
});
