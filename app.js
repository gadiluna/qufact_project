document.getElementById('year').textContent = new Date().getFullYear();

const labVideo = document.getElementById('lab-video');
if (labVideo) {
  const story = document.getElementById('home');
  const stage = labVideo.parentElement;
  const heading = document.getElementById('hero-title');
  const secondMessage = story.querySelector('.hero-second');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scrollFrame = 0;

  function renderLabFrame() {
    scrollFrame = 0;
    if (!story.classList.contains('has-scroll-video')) return;
    const travel = Math.max(1, story.offsetHeight - stage.offsetHeight);
    const progress = Math.max(0, Math.min(1, -story.getBoundingClientRect().top / travel));
    heading.style.opacity = String(1 - Math.min(1, progress * 2.5));
    secondMessage.style.opacity = String(Math.max(0, Math.min(1, (progress - .35) / .2, (1 - progress) / .12)));
    if (labVideo.readyState >= 2 && !labVideo.seeking && Number.isFinite(labVideo.duration)) {
      const target = progress * Math.max(0, labVideo.duration - 1 / 30);
      if (Math.abs(labVideo.currentTime - target) > 1 / 60) {
        labVideo.currentTime = target;
      }
    }
  }

  function scheduleLabFrame() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(renderLabFrame);
  }

  function updateLabMotion() {
    story.classList.toggle('has-scroll-video', !reducedMotion.matches && !labVideo.error);
    heading.style.opacity = '1';
    secondMessage.style.opacity = '0';
    labVideo.pause();
    if (reducedMotion.matches && labVideo.readyState >= 1) labVideo.currentTime = 0;
    scheduleLabFrame();
  }

  window.addEventListener('scroll', scheduleLabFrame, { passive: true });
  window.addEventListener('resize', scheduleLabFrame);
  labVideo.addEventListener('loadeddata', scheduleLabFrame);
  labVideo.addEventListener('seeked', scheduleLabFrame);
  labVideo.addEventListener('error', updateLabMotion);
  reducedMotion.addEventListener('change', updateLabMotion);
  updateLabMotion();
}

const blochVector = document.getElementById('bloch-vector');
if (blochVector) {
  const arrowhead = document.getElementById('bloch-arrowhead');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animationFrame;

  function animateBlochSphere(timestamp) {
    const phase = timestamp / 2400;
    // Orthographic projection of a unit state precessing at a fixed polar angle.
    const x = 180 + 109.12 * Math.cos(phase);
    const y = 120.8 + 37.32 * Math.sin(phase);
    const angle = Math.atan2(y - 180, x - 180) * 180 / Math.PI;
    blochVector.setAttribute('x2', x);
    blochVector.setAttribute('y2', y);
    arrowhead.setAttribute('transform', `translate(${x} ${y}) rotate(${angle})`);
    animationFrame = window.requestAnimationFrame(animateBlochSphere);
  }

  function updateBlochMotion() {
    window.cancelAnimationFrame(animationFrame);
    if (!reducedMotion.matches) {
      animationFrame = window.requestAnimationFrame(animateBlochSphere);
    }
  }

  reducedMotion.addEventListener('change', updateBlochMotion);
  updateBlochMotion();
}
