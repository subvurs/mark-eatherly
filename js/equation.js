/**
 * Nyx equation tooltips + phase diagram canvas
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    drawPhaseDiagram();
  });

  function drawPhaseDiagram() {
    const canvas = document.getElementById('phase-diagram');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const dispW = 500;
    const dispH = 360;
    canvas.width = dispW * dpr;
    canvas.height = dispH * dpr;
    canvas.style.width = dispW + 'px';
    canvas.style.height = dispH + 'px';
    ctx.scale(dpr, dpr);

    const pad = { top: 30, right: 30, bottom: 50, left: 55 };
    const plotW = dispW - pad.left - pad.right;
    const plotH = dispH - pad.top - pad.bottom;

    // Clear
    ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
    ctx.fillRect(0, 0, dispW, dispH);

    // Axes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // Axis labels (qualitative — no numeric scale)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('d  (perturbation / coherence ratio)', pad.left + plotW / 2, dispH - 8);

    ctx.save();
    ctx.translate(14, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Emergence', 0, 0);
    ctx.restore();

    // Qualitative Gaussian curve — illustrative shape, not real parameters
    // Peak at ~45% of plot width, moderate spread
    const peakFrac = 0.45;
    const spread = 0.012;
    const steps = 200;

    function fracToX(f) { return pad.left + f * plotW; }
    function valToY(v) { return pad.top + plotH - v * plotH; }

    // Draw curve
    ctx.beginPath();
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2.5;
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const val = Math.exp(-Math.pow(f - peakFrac, 2) / (2 * spread));
      const x = fracToX(f);
      const y = valToY(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill under curve
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const val = Math.exp(-Math.pow(f - peakFrac, 2) / (2 * spread));
      if (i === 0) ctx.moveTo(fracToX(f), valToY(val));
      else ctx.lineTo(fracToX(f), valToY(val));
    }
    ctx.lineTo(fracToX(1), valToY(0));
    ctx.lineTo(fracToX(0), valToY(0));
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
    grad.addColorStop(0, 'rgba(129, 140, 248, 0.15)');
    grad.addColorStop(1, 'rgba(129, 140, 248, 0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Chaos Valley marker (at peak)
    const cvX = fracToX(peakFrac);
    const cvY = valToY(1);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cvX, pad.top + plotH);
    ctx.lineTo(cvX, cvY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(cvX, cvY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#34d399';
    ctx.fill();

    ctx.fillStyle = '#34d399';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Chaos Valley', cvX, cvY - 14);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('d*', cvX, pad.top + plotH + 16);

    // Death Threshold marker (right of peak)
    const dtFrac = 0.58;
    const dtX = fracToX(dtFrac);
    const dtVal = Math.exp(-Math.pow(dtFrac - peakFrac, 2) / (2 * spread));
    const dtY = valToY(dtVal);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dtX, pad.top);
    ctx.lineTo(dtX, pad.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Death Threshold', dtX + 2, dtY - 10);

    // Region labels
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Stasis', fracToX(0.12), valToY(0.15));
    ctx.fillText('Dissolution', fracToX(0.82), valToY(0.15));

    // Minimal axis indicators (no numeric values)
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('0', fracToX(0), pad.top + plotH + 16);
    ctx.fillText('d', fracToX(1), pad.top + plotH + 16);

    ctx.textAlign = 'right';
    ctx.fillText('0', pad.left - 8, valToY(0) + 4);
    ctx.fillText('max', pad.left - 8, valToY(1) + 4);
  }

  // Redraw on resize
  window.addEventListener('resize', () => {
    drawPhaseDiagram();
  });
})();
