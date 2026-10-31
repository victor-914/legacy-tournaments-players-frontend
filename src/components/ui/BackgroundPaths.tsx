"use client";

import { useEffect, useRef } from "react";
import styled from "styled-components";

// Flowing gold "background paths": two mirrored fans of bezier curves with a
// bright segment travelling along each one.
//
// Drawn on a 2D canvas rather than as animated SVG. The first version animated
// stroke-dashoffset on 36 SVG paths, which forced the browser to re-rasterise a
// full-viewport SVG every frame and measured ~59 -> ~35fps. Canvas strokes the
// same curves in well under a millisecond per frame. Also:
//   - Path2D objects and path lengths are computed once.
//   - Rendered at 1x device pixels: the lines are thin and soft, so higher DPR
//     buys nothing visible but multiplies fill cost.
//   - 30fps on touch devices, rAF stops when the tab is hidden.
//   - prefers-reduced-motion draws one still frame.

const VIEW_W = 696;
const VIEW_H = 316;
const PATHS_PER_FAN = 18;
const GOLD = "212, 175, 55";

interface Curve {
  d: string;
  width: number;
  alpha: number;
  // Seconds for the bright segment to travel the full curve once.
  period: number;
  phase: number;
}

function buildPath(index: number, direction: 1 | -1) {
  const shift = index * 5 * direction;
  const lift = index * 6;
  return [
    `M${-(380 - shift)} ${-(189 + lift)}`,
    `C${-(380 - shift)} ${-(189 + lift)} ${-(312 - shift)} ${216 - lift} ${152 - shift} ${343 - lift}`,
    `C${616 - shift} ${470 - lift} ${684 - shift} ${875 - lift} ${684 - shift} ${875 - lift}`
  ].join(" ");
}

const FANS: { mirrored: boolean; curves: Curve[] }[] = ([1, -1] as const).map((direction) => ({
  mirrored: direction === -1,
  curves: Array.from({ length: PATHS_PER_FAN }, (_, index) => ({
    d: buildPath(index, direction),
    width: 0.5 + index * 0.04,
    alpha: 0.18 + index * 0.035,
    period: 18 + ((index * 7) % 13),
    phase: ((index * 3.7) % 20) / 20
  }))
}));

interface PreparedCurve extends Curve {
  path: Path2D;
  length: number;
}

function prepare(): { mirrored: boolean; curves: PreparedCurve[]; base: Path2D }[] {
  // getTotalLength needs a live SVG path element; it never enters the DOM tree.
  const measurer = document.createElementNS("http://www.w3.org/2000/svg", "path");
  return FANS.map(({ mirrored, curves }) => {
    const base = new Path2D();
    const prepared = curves.map((curve) => {
      measurer.setAttribute("d", curve.d);
      const path = new Path2D(curve.d);
      base.addPath(path);
      return { ...curve, path, length: measurer.getTotalLength() };
    });
    return { mirrored, curves: prepared, base };
  });
}

export function BackgroundPaths() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const fans = prepare();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const frameInterval = isTouch ? 1000 / 30 : 0;

    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastFrame = 0;
    const start = performance.now();

    function resize() {
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
    }

    function draw(now: number) {
      if (!ctx) return;
      const seconds = (now - start) / 1000;
      // Equivalent of preserveAspectRatio="xMidYMid slice" (cover).
      const scale = Math.max(width / VIEW_W, height / VIEW_H);
      const offsetX = (width - VIEW_W * scale) / 2;
      const offsetY = (height - VIEW_H * scale) / 2;
      // Only one fan on narrow screens; two get busy behind stacked content.
      const visibleFans = width < 768 ? fans.slice(0, 1) : fans;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";

      for (const fan of visibleFans) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (fan.mirrored) {
          // Rotate the second fan 180deg so curves sweep in from both corners.
          ctx.translate(width, height);
          ctx.scale(-1, -1);
        }
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
        const fanAlpha = fan.mirrored ? 0.6 : 1;

        // Faint resting curves, one stroke for the whole fan.
        ctx.setLineDash([]);
        ctx.lineWidth = 0.4;
        ctx.strokeStyle = `rgba(${GOLD}, ${0.07 * fanAlpha})`;
        ctx.stroke(fan.base);

        // Travelling bright segments: ~35% of each curve, the rest gap.
        for (const curve of fan.curves) {
          const progress = reducedMotion ? curve.phase : (seconds / curve.period + curve.phase) % 1;
          ctx.setLineDash([curve.length * 0.35, curve.length * 0.65]);
          ctx.lineDashOffset = curve.length * (1 - progress * 2);
          ctx.lineWidth = curve.width;
          ctx.strokeStyle = `rgba(${GOLD}, ${curve.alpha * fanAlpha})`;
          ctx.stroke(curve.path);
        }
      }
    }

    function loop(now: number) {
      frameId = requestAnimationFrame(loop);
      if (frameInterval && now - lastFrame < frameInterval) return;
      lastFrame = now;
      draw(now);
    }

    function startLoop() {
      if (reducedMotion || frameId || document.hidden) return;
      frameId = requestAnimationFrame(loop);
    }

    function stopLoop() {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }

    function onVisibilityChange() {
      if (document.hidden) stopLoop();
      else startLoop();
    }

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", onVisibilityChange);

    resize();
    draw(performance.now());
    startLoop();

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return <Canvas ref={canvasRef} aria-hidden="true" />;
}

const Canvas = styled.canvas`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  /* Fade toward the top so the sticky nav area stays clean. */
  mask-image: linear-gradient(180deg, transparent 0%, #000 22%, #000 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 22%, #000 100%);
`;
