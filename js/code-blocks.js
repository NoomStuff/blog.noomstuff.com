document.addEventListener("DOMContentLoaded", () =>
{
    function loadCSS(href)
    {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    }

    function loadJS(src, isModule = false)
    {
        return new Promise(resolve =>
        {
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
        loadJS("https://cdn.jsdelivr.net/npm/prismjs/components/prism-markup.min.js"),
        loadJS("https://cdn.jsdelivr.net/npm/prismjs/components/prism-css.min.js"),
        loadJS("https://cdn.jsdelivr.net/npm/prismjs/components/prism-javascript.min.js"),
        loadJS("https://cdn.jsdelivr.net/npm/prismjs/components/prism-python.min.js"),
        loadJS("https://cdn.jsdelivr.net/npm/prismjs/components/prism-csharp.min.js")
    ]).then(() =>
    {
        document.querySelectorAll("pre.collapsible").forEach(pre =>
        {
            const collapsedHeight = 300;
            pre.style.maxHeight = collapsedHeight + "px";

            pre.addEventListener("click", () =>
            {
                if (pre.classList.contains("expanded"))
                {
                    pre.style.maxHeight = collapsedHeight + "px";
                    pre.classList.remove("expanded");
                }
                else
                {
                    pre.style.maxHeight = pre.scrollHeight + "px";
                    pre.classList.add("expanded");
                }
            });
        });

        if (window.Prism)
        {
            Prism.highlightAll();
        }
    });
});
