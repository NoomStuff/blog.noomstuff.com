const maxTilt = 4;
const tileScale = 1.005;

const wrappers = document.querySelectorAll(".hover-tilt");

wrappers.forEach((wrapper) => {
  const tile = wrapper.children[0];

  if (!tile) {
    return;
  }

  wrapper.style.perspective = "800px";
  wrapper.style.perspectiveOrigin = "center";

  wrapper.addEventListener("mouseenter", () => {
    tile.style.transition =
      "transform 300ms cubic-bezier(0.2, 1.25, 0.3, 1)";
  });

  wrapper.addEventListener("mousemove", (event) => {
    const rect = wrapper.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
    const sizeFactor = Math.min(1, 320 / Math.max(rect.width, rect.height));
    const tilt = maxTilt * sizeFactor * 2;
    const rotateX = -offsetY * tilt;
    const rotateY = offsetX * tilt;

    tile.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${tileScale})`;
  });

  wrapper.addEventListener("mouseleave", () => {
    tile.style.transition =
      "transform 500ms cubic-bezier(0.4, 2.4, 0.4, 1)";
    tile.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  });
});
