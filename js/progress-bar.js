document.addEventListener("DOMContentLoaded", () =>
{
    const bar = document.createElement("div");
    bar.id = "progress-bar";
    document.body.appendChild(bar);

    function updateProgress()
    {
        const scrollTop = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = (scrollTop / documentHeight) * 110;
        bar.style.width = scrollPercentage + "%";
    }

    window.addEventListener("scroll", updateProgress);
    window.addEventListener("resize", updateProgress);

    updateProgress();
});
