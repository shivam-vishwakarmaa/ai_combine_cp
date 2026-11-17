import React, { useEffect, useRef } from 'react';
import type { BEDetection } from '../types/backend';

interface DetectionOverlayProps {
  detections: BEDetection[];
  width?: number | string;
  height?: number | string;
  className?: string;
  showLabels?: boolean;
  sourceWidth?: number;
  sourceHeight?: number;
}

/**
 * Tactical HUD bounding-box overlay.
 * Draws animated, glowing boxes with corner brackets for every detection.
 */
export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  detections,
  width = '100%',
  height = '100%',
  className = '',
  showLabels = true,
  sourceWidth,
  sourceHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let time = 0;

    const render = () => {
      time += 0.03;
      const rect = container.getBoundingClientRect();
      const cw = rect.width || 640;
      const ch = rect.height || 360;

      const dpr = window.devicePixelRatio || 1;
      const wantW = Math.round(cw * dpr);
      const wantH = Math.round(ch * dpr);
      if (canvas.width !== wantW || canvas.height !== wantH) {
        canvas.width = wantW;
        canvas.height = wantH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      const srcW = sourceWidth && sourceWidth > 0 ? sourceWidth : 640;
      const srcH = sourceHeight && sourceHeight > 0 ? sourceHeight : 480;

      for (let idx = 0; idx < detections.length; idx++) {
        const det = detections[idx];
        let x = 0, y = 0, w = 0, h = 0;
        let valid = false;

        if (det.bbox && det.bbox.length === 4) {
          const [bx1, by1, bx2, by2] = det.bbox;
          if (bx1 <= 1 && by1 <= 1 && bx2 <= 1 && by2 <= 1) {
            x = bx1 * cw; y = by1 * ch;
            w = (bx2 - bx1) * cw; h = (by2 - by1) * ch;
          } else {
            x = (bx1 / srcW) * cw; y = (by1 / srcH) * ch;
            w = ((bx2 - bx1) / srcW) * cw; h = ((by2 - by1) / srcH) * ch;
          }
          valid = true;
        }

        if (!valid || w < 4 || h < 4) continue;
        const rx = Math.max(2, x), ry = Math.max(2, y);
        const rw = Math.min(cw - rx - 2, w), rh = Math.min(ch - ry - 2, h);
        if (rw < 4 || rh < 4) continue;

        const clsLower = (det.class || 'object').toLowerCase();
        const catLower = (det.category || '').toLowerCase();
        const isFire = clsLower.includes('fire') || clsLower.includes('flame') || (catLower === 'fire_smoke' && clsLower.includes('fire'));
        const isSmoke = clsLower.includes('smoke');
        const isHuman = catLower === 'human' || ['person', 'human', 'people', 'man', 'woman'].includes(clsLower);
        const isAnimal = catLower === 'animal' || [
          'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant',
          'bear', 'zebra', 'giraffe', 'deer', 'fox', 'wolf', 'lion',
          'tiger', 'monkey', 'rabbit', 'snake', 'boar', 'animal', 'wildlife'
        ].includes(clsLower);
        const isVehicle = catLower === 'vehicle' || ['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(clsLower);

        // Vibrant distinct tactical palette:
        // Red = Fire, Orange = Smoke, Neon Cyan = Human, Emerald = Animal, Sky Blue = Vehicle
        const mainColor = isFire
          ? '#ff2200'
          : isSmoke
          ? '#ff9900'
          : isHuman
          ? '#00f0ff'
          : isAnimal
          ? '#10b981'
          : isVehicle
          ? '#38bdf8'
          : '#a855f7';

        const glowColor = isFire
          ? 'rgba(255,34,0,0.22)'
          : isSmoke
          ? 'rgba(255,153,0,0.18)'
          : isHuman
          ? 'rgba(0,240,255,0.20)'
          : isAnimal
          ? 'rgba(16,185,129,0.22)'
          : 'rgba(56,189,248,0.16)';

        const emphasized = isFire || isSmoke || isHuman || isAnimal;
        const confPercent = Math.round((det.confidence || 0) * 100);

        ctx.fillStyle = glowColor;
        ctx.fillRect(rx, ry, rw, rh);

        ctx.shadowColor = mainColor;
        ctx.shadowBlur = emphasized ? 14 + Math.sin(time * 4) * 4 : 8;
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = emphasized ? 2.4 : 1.6;
        ctx.strokeRect(rx, ry, rw, rh);

        const cornerLen = Math.min(rw, rh, emphasized ? 22 : 14);
        ctx.lineWidth = emphasized ? 3.5 : 2.5;
        ctx.strokeStyle = '#ffffff';
        ctx.shadowBlur = 10;

        [[rx, ry, rx + cornerLen, ry, rx, ry + cornerLen],
         [rx + rw - cornerLen, ry, rx + rw, ry, rx + rw, ry + cornerLen],
         [rx, ry + rh - cornerLen, rx, ry + rh, rx + cornerLen, ry + rh],
         [rx + rw - cornerLen, ry + rh, rx + rw, ry + rh, rx + rw, ry + rh - cornerLen]
        ].forEach(([ax, ay, bx, by, cx, cy]) => {
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.stroke();
        });

        if (emphasized) {
          const cx = rx + rw / 2, cy = ry + rh / 2;
          ctx.lineWidth = 1; ctx.strokeStyle = mainColor; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.moveTo(cx - 10, cy); ctx.lineTo(cx + 10, cy);
          ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy + 10);
          ctx.stroke();
        }

        if (showLabels) {
          let labelText = '';
          if (det.display_label) {
            labelText = `${det.display_label.toUpperCase()}  ${confPercent}%`;
          } else if (isHuman) {
            labelText = `HUMAN DETECTED (${clsLower.toUpperCase()})  ${confPercent}%`;
          } else if (isAnimal) {
            labelText = `ANIMAL DETECTED (${clsLower.toUpperCase()})  ${confPercent}%`;
          } else if (isFire) {
            labelText = `FIRE DETECTED  ${confPercent}%`;
          } else if (isSmoke) {
            labelText = `SMOKE DETECTED  ${confPercent}%`;
          } else if (isVehicle) {
            labelText = `VEHICLE (${clsLower.toUpperCase()})  ${confPercent}%`;
          } else {
            labelText = `${clsLower.toUpperCase()}  ${confPercent}%`;
          }

          ctx.font = emphasized ? '700 12px Inter, system-ui, sans-serif' : '500 11px Inter, system-ui, sans-serif';
          const textWidth = ctx.measureText(labelText).width;
          const padX = 8, badgeW = textWidth + padX * 2;
          const badgeH = emphasized ? 24 : 20;
          const badgeX = rx, badgeY = Math.max(2, ry - badgeH - 3);

          ctx.shadowBlur = 0;
          ctx.fillStyle = emphasized ? 'rgba(5,10,18,0.92)' : 'rgba(0,0,0,0.7)';
          ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
          ctx.fillStyle = mainColor;
          ctx.fillRect(badgeX, badgeY, 3.5, badgeH);
          ctx.fillStyle = emphasized ? mainColor : '#e6ecf5';
          ctx.fillText(labelText, badgeX + padX + 3, badgeY + badgeH - 7);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => { cancelAnimationFrame(animId); };
  }, [detections, showLabels, sourceWidth, sourceHeight]);

  return (
    <div
      ref={containerRef}
      className={'wf-overlay-root ' + className}
      style={{ position: 'relative', width, height }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
    </div>
  );
};

export default DetectionOverlay;
