// Particle animation for Joshua Lin's name
document.addEventListener('DOMContentLoaded', function() {
  const canvasElement = document.getElementById('particle-canvas');
  if (!canvasElement) return;

  const mousePosition = { x: 0, y: 0 };
  let isTouching = false;
  let isMobile = false;
  
  const ctx = canvasElement.getContext('2d');
  if (!ctx) return;

  const updateCanvasSize = () => {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    isMobile = window.innerWidth < 768; // Set mobile breakpoint
  };

  updateCanvasSize();

  let particles = [];
  let textImageData = null;

  function createTextImage() {
    if (!ctx || !canvasElement) return 0;

    ctx.fillStyle = 'white';
    ctx.save();
    
    // Set font size based on mobile or desktop
    const fontSize = isMobile ? 60 : 100;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    
    // Measure text width to center it
    const text = "Joshua Lin";
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    
    // Position text in center of canvas
    const x = (canvasElement.width - textWidth) / 2;
    const y = canvasElement.height / 2;
    
    // Draw the text
    ctx.fillText(text, x, y);
    
    ctx.restore();

    textImageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    return fontSize / 100; // Return scale factor
  }

  function createParticle(scale) {
    if (!ctx || !canvasElement || !textImageData) return null;

    const data = textImageData.data;

    for (let attempt = 0; attempt < 100; attempt++) {
      const x = Math.floor(Math.random() * canvasElement.width);
      const y = Math.floor(Math.random() * canvasElement.height);

      if (data[(y * canvasElement.width + x) * 4 + 3] > 128) {
        // Determine if particle is in first or second part of name
        const centerX = canvasElement.width / 2;
        const isSecondName = x > centerX;
        
        return {
          x: x,
          y: y,
          baseX: x,
          baseY: y,
          size: Math.random() * 1 + 0.5,
          color: 'white', 
          scatteredColor: isSecondName ? '#FF9900' : '#00DCFF', // Orange for "Lin", Cyan for "Joshua"
          isSecondName: isSecondName,
          life: Math.random() * 100 + 50
        };
      }
    }

    return null;
  }

  function createInitialParticles(scale) {
    const baseParticleCount = 7000; // Increased base count for higher density
    const particleCount = Math.floor(baseParticleCount * Math.sqrt((canvasElement.width * canvasElement.height) / (1920 * 1080)));
    for (let i = 0; i < particleCount; i++) {
      const particle = createParticle(scale);
      if (particle) particles.push(particle);
    }
  }

  let animationFrameId;

  function animate(scale) {
    if (!ctx || !canvasElement) return;
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    const { x: mouseX, y: mouseY } = mousePosition;
    const maxDistance = 240;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxDistance && (isTouching || !('ontouchstart' in window))) {
        const force = (maxDistance - distance) / maxDistance;
        const angle = Math.atan2(dy, dx);
        const moveX = Math.cos(angle) * force * 60;
        const moveY = Math.sin(angle) * force * 60;
        p.x = p.baseX - moveX;
        p.y = p.baseY - moveY;
        
        ctx.fillStyle = p.scatteredColor;
      } else {
        p.x += (p.baseX - p.x) * 0.1;
        p.y += (p.baseY - p.y) * 0.1;
        ctx.fillStyle = 'white'; 
      }

      ctx.fillRect(p.x, p.y, p.size, p.size);

      p.life--;
      if (p.life <= 0) {
        const newParticle = createParticle(scale);
        if (newParticle) {
          particles[i] = newParticle;
        } else {
          particles.splice(i, 1);
          i--;
        }
      }
    }

    const baseParticleCount = 7000;
    const targetParticleCount = Math.floor(baseParticleCount * Math.sqrt((canvasElement.width * canvasElement.height) / (1920 * 1080)));
    while (particles.length < targetParticleCount) {
      const newParticle = createParticle(scale);
      if (newParticle) particles.push(newParticle);
    }

    animationFrameId = requestAnimationFrame(() => animate(scale));
  }

  const scale = createTextImage();
  createInitialParticles(scale);
  animate(scale);

  const handleResize = () => {
    updateCanvasSize();
    const newScale = createTextImage();
    particles = [];
    createInitialParticles(newScale);
  };

  const handleMove = (x, y) => {
    mousePosition.x = x;
    mousePosition.y = y;
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchStart = () => {
    isTouching = true;
  };

  const handleTouchEnd = () => {
    isTouching = false;
    mousePosition.x = 0;
    mousePosition.y = 0;
  };

  const handleMouseLeave = () => {
    if (!('ontouchstart' in window)) {
      mousePosition.x = 0;
      mousePosition.y = 0;
    }
  };

  window.addEventListener('resize', handleResize);
  canvasElement.addEventListener('mousemove', handleMouseMove);
  canvasElement.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvasElement.addEventListener('mouseleave', handleMouseLeave);
  canvasElement.addEventListener('touchstart', handleTouchStart);
  canvasElement.addEventListener('touchend', handleTouchEnd);

  // Clean up function (not used in this implementation but good practice)
  function cleanup() {
    window.removeEventListener('resize', handleResize);
    canvasElement.removeEventListener('mousemove', handleMouseMove);
    canvasElement.removeEventListener('touchmove', handleTouchMove);
    canvasElement.removeEventListener('mouseleave', handleMouseLeave);
    canvasElement.removeEventListener('touchstart', handleTouchStart);
    canvasElement.removeEventListener('touchend', handleTouchEnd);
    cancelAnimationFrame(animationFrameId);
  }
});
