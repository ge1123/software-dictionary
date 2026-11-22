// Keep the diagram at a readable scale. Give a cue only when its frame can scroll.
for (const frame of document.querySelectorAll('.diagram, .er-scroll')) {
  const hint = document.createElement('small');
  hint.textContent = '左右捲動可看完整圖。';
  frame.after(hint);
  const update = () => { hint.hidden = frame.scrollWidth <= frame.clientWidth + 1; };
  update();
  const observer = new ResizeObserver(update);
  observer.observe(frame);
  observer.observe(frame.firstElementChild);
}
