"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BubbleGame, NEON_PALETTE, parseKey } from "@/lib/game/BubbleGame";

type GameCanvasProps = {
  reducedMotion: boolean;
};

export function GameCanvas({ reducedMotion }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<BubbleGame>(new BubbleGame());
  const aimingRef = useRef(false);
  const rafRef = useRef<number>(0);
  const prevOverRef = useRef(false);
  const [status, setStatus] = useState("");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g = gameRef.current;
    const dpr = Math.min(
      2,
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    );
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.setDimensions(w, h);

    const pulse = reducedMotion ? 1 : 0.75 + 0.25 * Math.sin(g.pulseT);

    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#0a0514");
    grd.addColorStop(0.45, "#12082a");
    grd.addColorStop(1, "#050810");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = `rgba(5, 217, 232, ${0.12 * pulse})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 24) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255, 42, 109, 0.35)";
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(0, g.dangerY);
    ctx.lineTo(w, g.dangerY);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const [k, colorIdx] of g.grid) {
      const [r, c] = parseKey(k);
      const p = g.cellCenter(r, c);
      const hex = NEON_PALETTE[colorIdx % NEON_PALETTE.length]!;
      drawBubble(ctx, p.x, p.y, g.R, hex, pulse, reducedMotion);
    }

    if (!g.gameOver) {
      const la = g.aimAngle;
      const len = g.shooterY - g.marginY;
      ctx.strokeStyle = `rgba(5, 217, 232, ${0.45 * pulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(g.shooterX, g.shooterY);
      ctx.lineTo(
        g.shooterX + Math.cos(la) * len,
        g.shooterY - Math.sin(la) * len,
      );
      ctx.stroke();
    }

    if (g.projectile) {
      const { x, y, color } = g.projectile;
      const hex = NEON_PALETTE[color % NEON_PALETTE.length]!;
      drawBubble(ctx, x, y, g.R, hex, pulse, reducedMotion);
    }

    if (!g.gameOver && !g.projectile) {
      const hex = NEON_PALETTE[g.currentColor % NEON_PALETTE.length]!;
      drawBubble(
        ctx,
        g.shooterX,
        g.shooterY,
        g.R * 0.95,
        hex,
        pulse,
        reducedMotion,
      );
    }

    const nx = g.shooterX + g.R * 2.4;
    const ny = g.shooterY;
    const nh = NEON_PALETTE[g.nextColor % NEON_PALETTE.length]!;
    drawBubble(ctx, nx, ny, g.R * 0.55, nh, pulse * 0.9, reducedMotion);
    ctx.fillStyle = "rgba(200,255,255,0.5)";
    ctx.font = "10px ui-monospace, monospace";
    ctx.fillText("NEXT", nx - g.R * 0.9, ny + g.R * 1.15);

    ctx.fillStyle = "rgba(180, 255, 255, 0.92)";
    ctx.font = "bold 13px ui-monospace, monospace";
    ctx.fillText(`SCORE ${g.score}`, 12, 22);
    ctx.fillText(`MISS ${g.misses}/5`, 12, 40);
  }, [reducedMotion]);

  useEffect(() => {
    const loop = () => {
      const gm = gameRef.current;
      gm.update();
      if (gm.gameOver !== prevOverRef.current) {
        prevOverRef.current = gm.gameOver;
        if (gm.gameOver) {
          setStatus(
            gm.clearedAll
              ? "Sector clear — neon victory."
              : "Game over — tap Restart.",
          );
        } else {
          setStatus("");
        }
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  useEffect(() => {
    const ro = new ResizeObserver(() => draw());
    const c = canvasRef.current;
    if (c) ro.observe(c);
    return () => ro.disconnect();
  }, [draw]);

  function canvasToLocal(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (gameRef.current.gameOver) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    aimingRef.current = true;
    const { x, y } = canvasToLocal(e);
    gameRef.current.setAimFromPoint(x, y);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!aimingRef.current || gameRef.current.gameOver) return;
    const { x, y } = canvasToLocal(e);
    gameRef.current.setAimFromPoint(x, y);
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!aimingRef.current) return;
    aimingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (!gameRef.current.gameOver) gameRef.current.shoot();
  }

  return (
    <div className="relative w-full max-w-md">
      <canvas
        ref={canvasRef}
        className="cyber-canvas h-[min(72vh,520px)] w-full touch-none rounded-xl border border-cyan-500/30 bg-black/50"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {status && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center">
          <p className="rounded-lg border border-fuchsia-500/40 bg-black/75 px-4 py-3 font-mono text-sm text-fuchsia-100 shadow-[0_0_30px_rgba(255,0,255,0.25)]">
            {status}
          </p>
        </div>
      )}
      <p className="mt-2 text-center text-[11px] text-cyan-300/60">
        Swipe on the field to aim · release to fire
      </p>
      <button
        type="button"
        className="cyber-btn-outline mx-auto mt-3 block w-full max-w-xs py-2 text-sm"
        onClick={() => {
          gameRef.current.reset();
          prevOverRef.current = false;
          setStatus("");
        }}
      >
        Restart run
      </button>
    </div>
  );
}

function drawBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  R: number,
  hex: string,
  pulse: number,
  reducedMotion: boolean,
) {
  const p = reducedMotion ? 1 : pulse;
  const g = ctx.createRadialGradient(
    x - R * 0.35,
    y - R * 0.35,
    R * 0.1,
    x,
    y,
    R * 1.1,
  );
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.25, hex);
  g.addColorStop(1, `${hex}44`);
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.shadowColor = hex;
  ctx.shadowBlur = reducedMotion ? 8 : 12 * p;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = `${hex}cc`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}
