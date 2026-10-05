function animateCount(el, target, duration = 1100) {
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent =
      new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
        value
      ) + " ₽";
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

document.querySelectorAll(".anim-count").forEach((el) => {
  const target = Number(el.dataset.target) || 0;
  animateCount(el, target);
});
