document.addEventListener("DOMContentLoaded", () => {
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
