document.getElementById('year').textContent = new Date().getFullYear();

const labVideo = document.getElementById('lab-video');
if (labVideo) {
  const story = document.getElementById('home');
  const stage = labVideo.parentElement;
  const heading = document.getElementById('hero-title');
  const secondMessage = story.querySelector('.hero-second');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const frameCanvas = document.getElementById('lab-frames');
  const frameContext = frameCanvas.getContext('2d');
  const frameSequence = new Image();
  // Touch browsers may defer paused-video decoding, including in low-power mode.
  // These frames come from the same footage and need no playback permission.
  let useFrameSequence = Boolean(frameContext) &&
    (navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);
  let sequenceReady = false;
  let lastFrame = -1;
  let scrollFrame = 0;

  function renderLabFrame() {
    scrollFrame = 0;
    if (!story.classList.contains('has-scroll-video')) return;
    const travel = Math.max(1, story.offsetHeight - stage.offsetHeight);
    const progress = Math.max(0, Math.min(1, -story.getBoundingClientRect().top / travel));
    heading.style.opacity = String(1 - Math.min(1, progress * 2.5));
    secondMessage.style.opacity = String(Math.max(0, Math.min(1, (progress - .35) / .2, (1 - progress) / .12)));
    if (useFrameSequence) {
      if (!sequenceReady) return;
      const frame = Math.round(progress * 59);
      if (frame !== lastFrame) {
        frameContext.drawImage(frameSequence,
          (frame % 6) * 360, Math.floor(frame / 6) * 640, 360, 640,
          0, 0, 360, 640);
        lastFrame = frame;
      }
      frameCanvas.hidden = false;
    } else if (labVideo.readyState >= 1 && !labVideo.seeking && Number.isFinite(labVideo.duration)) {
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
    story.classList.toggle('has-scroll-video', !reducedMotion.matches && (useFrameSequence || !labVideo.error));
    heading.style.opacity = '1';
    secondMessage.style.opacity = '0';
    frameCanvas.hidden = true;
    labVideo.pause();
    if (reducedMotion.matches && labVideo.readyState >= 1) labVideo.currentTime = 0;
    if (!reducedMotion.matches) {
      if (useFrameSequence) {
        if (!frameSequence.src) frameSequence.src = frameCanvas.dataset.src;
      } else if (!labVideo.getAttribute('src')) {
        labVideo.src = labVideo.dataset.src;
        labVideo.load();
      }
    }
    scheduleLabFrame();
  }

  frameSequence.addEventListener('load', () => {
    sequenceReady = true;
    scheduleLabFrame();
  });
  frameSequence.addEventListener('error', () => {
    useFrameSequence = false;
    updateLabMotion();
  });
  window.addEventListener('scroll', scheduleLabFrame, { passive: true });
  window.addEventListener('resize', scheduleLabFrame);
  window.addEventListener('pageshow', scheduleLabFrame);
  labVideo.addEventListener('loadedmetadata', scheduleLabFrame);
  labVideo.addEventListener('durationchange', scheduleLabFrame);
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
