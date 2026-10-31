"use client";

import { useEffect, useRef } from "react";
import styled from "styled-components";

// Concentric "ripple" shader, re-tinted to the Legacy gold palette.
//
// Written against raw WebGL instead of three.js on purpose: the effect is a
// single full-screen quad, and three.js would add ~150KB gzipped to the public
// bundle for something this needs ~60 lines of GL to draw. It also:
//   - renders at a reduced internal resolution (the glow lines are soft, so
//     upscaling is invisible) and caps devicePixelRatio
//   - pauses when scrolled offscreen or the tab is hidden
//   - draws a single still frame under prefers-reduced-motion
//   - falls back to the CSS gradient on the wrapper if WebGL is unavailable

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 resolution;
uniform float time;
uniform float intensity;

void main(void) {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
  float t = time * 0.05;
  float lineWidth = 0.002;

  vec3 c = vec3(0.0);
  for (int j = 0; j < 3; j++) {
    for (int i = 0; i < 5; i++) {
      c[j] += lineWidth * float(i * i) /
        abs(fract(t - 0.01 * float(j) + float(i) * 0.01) * 5.0 - length(uv) + mod(uv.x + uv.y, 0.2));
    }
  }

  // Map the three phase-shifted channels onto gold / deep amber / pale champagne
  // rather than raw RGB, so the rings read as the brand gold.
  vec3 gold = vec3(0.831, 0.686, 0.216);
  vec3 amber = vec3(0.553, 0.427, 0.086);
  vec3 champagne = vec3(1.0, 0.94, 0.65);
  vec3 col = gold * c.r + amber * c.g + champagne * c.b * 0.55;
  // Reinhard tone-map: the raw rings spike far past 1.0 when a wave passes the
  // centre, which floods the section and kills text contrast. This compresses
  // the bursts into a glow while keeping the dim lines visible.
  col = col / (1.0 + col);

  // Vignette keeps the edges near the page background so the section blends in.
  float vignette = smoothstep(2.2, 0.35, length(uv));
  gl_FragColor = vec4(col * intensity * vignette, 1.0);
}
`;

interface ShaderBackdropProps {
  // 0-1 brightness multiplier; keep it low behind body copy.
  intensity?: number;
  // Internal render scale relative to CSS pixels. Lower is cheaper.
  renderScale?: number;
  className?: string;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function ShaderBackdrop({ intensity = 0.55, renderScale = 0.6, className }: ShaderBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false
    });
    if (!gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // One triangle that covers the viewport — cheaper than a two-triangle quad.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "resolution");
    const uTime = gl.getUniformLocation(program, "time");
    const uIntensity = gl.getUniformLocation(program, "intensity");
    gl.uniform1f(uIntensity, intensity);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Phones and tablets get 30fps; the motion is slow enough that it is not noticeable.
    const frameInterval = window.matchMedia("(pointer: coarse)").matches ? 1000 / 30 : 0;

    let time = 6;
    let frameId = 0;
    let lastFrame = 0;
    let lastTick = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;

    function resize() {
      if (!canvas || !gl) return;
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * renderScale;
      const width = Math.max(1, Math.round(canvas.clientWidth * scale));
      const height = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      gl.uniform2f(uResolution, width, height);
    }

    function draw() {
      if (!gl) return;
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop(now: number) {
      frameId = requestAnimationFrame(loop);
      if (frameInterval && now - lastFrame < frameInterval) return;
      // Advance by real elapsed time (clamped) so speed is frame-rate independent
      // and a resumed loop does not jump forward.
      const delta = lastTick ? Math.min(now - lastTick, 50) : 16;
      lastTick = now;
      lastFrame = now;
      time += delta * 0.003;
      draw();
    }

    function start() {
      if (reducedMotion || frameId || !isVisible || !isPageVisible) return;
      lastTick = 0;
      frameId = requestAnimationFrame(loop);
    }

    function stop() {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start();
      else stop();
    });
    intersectionObserver.observe(canvas);

    function onVisibilityChange() {
      isPageVisible = !document.hidden;
      if (isPageVisible) start();
      else stop();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    resize();
    draw();
    canvas.dataset.ready = "true";
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [intensity, renderScale]);

  return (
    <Wrap className={className} aria-hidden="true">
      <Canvas ref={canvasRef} />
    </Wrap>
  );
}

const Wrap = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  /* Visible before the first frame and wherever WebGL is unavailable. */
  background:
    radial-gradient(circle at 50% 45%, rgba(212, 175, 55, 0.16), transparent 55%),
    ${({ theme }) => theme.colors.background};
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 900ms ease;

  &[data-ready="true"] {
    opacity: 1;
  }
`;
