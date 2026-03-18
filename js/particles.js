/**
 * QuantumField — Custom canvas particle system
 * Modes: constellation, wave, orbital
 */
(function () {
  'use strict';

  const PARTICLE_COUNTS = { sm: 30, md: 50, lg: 80 };

  function getCount() {
    const w = window.innerWidth;
    if (w < 640) return PARTICLE_COUNTS.sm;
    if (w < 1200) return PARTICLE_COUNTS.md;
    return PARTICLE_COUNTS.lg;
  }

  class Particle {
    constructor(w, h, mode) {
      this.mode = mode;
      this.size = 1 + Math.random() * 2;
      this.alpha = 0.2 + Math.random() * 0.5;

      if (mode === 'orbital') {
        this.angle = Math.random() * Math.PI * 2;
        this.radius = 60 + Math.random() * Math.min(w, h) * 0.35;
        this.speed = (0.002 + Math.random() * 0.006) * (Math.random() < 0.5 ? 1 : -1);
        this.x = w / 2 + Math.cos(this.angle) * this.radius;
        this.y = h / 2 + Math.sin(this.angle) * this.radius;
      } else {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
      }

      if (mode === 'wave') {
        this.baseY = this.y;
        this.waveAmp = 20 + Math.random() * 40;
        this.waveFreq = 0.005 + Math.random() * 0.01;
        this.waveOffset = Math.random() * Math.PI * 2;
      }
    }

    update(w, h, time, mouseX, mouseY) {
      if (this.mode === 'constellation') {
        if (mouseX !== null && mouseY !== null) {
          const dx = this.x - mouseX;
          const dy = this.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80 && dist > 0) {
            const force = (80 - dist) / 80 * 0.8;
            this.vx += (dx / dist) * force;
            this.vy += (dy / dist) * force;
          } else if (dist < 200 && dist > 80) {
            const force = (dist - 80) / 120 * 0.03;
            this.vx -= (dx / dist) * force;
            this.vy -= (dy / dist) * force;
          }
        }
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -10) this.x = w + 10;
        if (this.x > w + 10) this.x = -10;
        if (this.y < -10) this.y = h + 10;
        if (this.y > h + 10) this.y = -10;

      } else if (this.mode === 'wave') {
        this.x += this.vx;
        this.y = this.baseY + Math.sin(time * this.waveFreq + this.waveOffset + this.x * 0.003) * this.waveAmp;
        if (this.x < -10) this.x = w + 10;
        if (this.x > w + 10) this.x = -10;

      } else if (this.mode === 'orbital') {
        this.angle += this.speed;
        this.x = w / 2 + Math.cos(this.angle) * this.radius;
        this.y = h / 2 + Math.sin(this.angle) * this.radius;
      }
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129, 140, 248, ${this.alpha})`;
      ctx.fill();
    }
  }

  class QuantumField {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.mode = canvas.dataset.mode || 'constellation';
      this.particles = [];
      this.running = false;
      this.mouseX = null;
      this.mouseY = null;
      this.time = 0;
      this.animId = null;
      this.w = 0;
      this.h = 0;

      this.resize();
      this.createParticles();
      this.setupObserver();

      if (this.mode === 'constellation') {
        this.setupMouse();
      }

      window.addEventListener('resize', () => {
        this.resize();
        this.adjustParticleCount();
      });
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = rect.width;
      this.h = rect.height;
      this.canvas.width = this.w * dpr;
      this.canvas.height = this.h * dpr;
      this.canvas.style.width = this.w + 'px';
      this.canvas.style.height = this.h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    createParticles() {
      const count = getCount();
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(this.w, this.h, this.mode));
      }
    }

    adjustParticleCount() {
      const target = getCount();
      while (this.particles.length < target) {
        this.particles.push(new Particle(this.w, this.h, this.mode));
      }
      while (this.particles.length > target) {
        this.particles.pop();
      }
    }

    setupMouse() {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
      });
      this.canvas.addEventListener('mouseleave', () => {
        this.mouseX = null;
        this.mouseY = null;
      });
    }

    setupObserver() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.start();
              this.canvas.classList.add('active');
            } else {
              this.stop();
              this.canvas.classList.remove('active');
            }
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(this.canvas);
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.loop();
    }

    stop() {
      this.running = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }

    loop() {
      if (!this.running) return;
      this.time++;
      this.update();
      this.draw();
      this.animId = requestAnimationFrame(() => this.loop());
    }

    update() {
      for (const p of this.particles) {
        p.update(this.w, this.h, this.time, this.mouseX, this.mouseY);
      }
    }

    draw() {
      this.ctx.clearRect(0, 0, this.w, this.h);

      // Connection lines for constellation mode
      if (this.mode === 'constellation') {
        for (let i = 0; i < this.particles.length; i++) {
          for (let j = i + 1; j < this.particles.length; j++) {
            const a = this.particles[i];
            const b = this.particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              const alpha = (1 - dist / 150) * 0.15;
              this.ctx.beginPath();
              this.ctx.moveTo(a.x, a.y);
              this.ctx.lineTo(b.x, b.y);
              this.ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
              this.ctx.lineWidth = 0.5;
              this.ctx.stroke();
            }
          }
        }
      }

      for (const p of this.particles) {
        p.draw(this.ctx);
      }
    }
  }

  // Init all canvases on load
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.particle-canvas').forEach((canvas) => {
      new QuantumField(canvas);
    });
  });
})();
