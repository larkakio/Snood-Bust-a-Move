/** Staggered bubble grid + projectile (Bust-a-Move style). */

export const NUM_COLORS = 6;
export const COLS = 8;
export const INIT_ROWS = 5;
export const MAX_ROWS = 13;
export const MISS_LIMIT = 5;
export const SPEED = 14;
export const STEP = 3;

const ANGLE_MIN = (12 * Math.PI) / 180;
const ANGLE_MAX = (168 * Math.PI) / 180;

export type BubbleGrid = Map<string, number>;

export type ProjectileState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: number;
};

export function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

export function parseKey(k: string): [number, number] {
  const [a, b] = k.split(",").map(Number);
  return [a, b];
}

export function neighbors(r: number, c: number): [number, number][] {
  const out: [number, number][] = [];
  const odd = r % 2;
  if (odd === 0) {
    if (r > 0) {
      out.push([r - 1, c - 1], [r - 1, c]);
    }
    if (c > 0) out.push([r, c - 1]);
    if (c < COLS - 1) out.push([r, c + 1]);
    if (r < MAX_ROWS) {
      out.push([r + 1, c - 1], [r + 1, c]);
    }
  } else {
    if (r > 0) {
      out.push([r - 1, c], [r - 1, c + 1]);
    }
    if (c > 0) out.push([r, c - 1]);
    if (c < COLS - 1) out.push([r, c + 1]);
    if (r < MAX_ROWS) {
      out.push([r + 1, c], [r + 1, c + 1]);
    }
  }
  return out.filter(([rr, cc]) => cc >= 0 && cc < COLS && rr >= 0 && rr <= MAX_ROWS);
}

function randColor(): number {
  return Math.floor(Math.random() * NUM_COLORS);
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.hypot(dx, dy);
}

export class BubbleGame {
  grid: BubbleGrid = new Map();
  score = 0;
  misses = 0;
  gameOver = false;
  clearedAll = false;
  aimAngle = Math.PI / 2;
  currentColor = 0;
  nextColor = 0;
  projectile: ProjectileState | null = null;

  /** Layout (pixels) */
  w = 320;
  h = 480;
  R = 14;
  marginX = 20;
  marginY = 24;
  gridWidth = 200;
  shooterX = 160;
  shooterY = 440;
  dangerY = 360;

  pulseT = 0;

  constructor() {
    this.reset();
  }

  setDimensions(width: number, height: number): void {
    this.w = width;
    this.h = height;
    this.R = Math.max(11, Math.min(22, width * 0.052));
    const dx = this.R * 2;
    this.gridWidth = (COLS - 1) * dx + this.R;
    this.marginX = (width - this.gridWidth) / 2;
    this.marginY = this.R * 1.8;
    this.shooterX = width / 2;
    this.shooterY = height - this.R * 2.8;
    this.dangerY = this.shooterY - this.R * 5.5;
  }

  cellCenter(r: number, c: number): { x: number; y: number } {
    const dx = this.R * 2;
    const dy = this.R * Math.sqrt(3);
    return {
      x: this.marginX + this.R + c * dx + (r % 2) * this.R,
      y: this.marginY + this.R + r * dy,
    };
  }

  reset(): void {
    this.grid.clear();
    for (let r = 0; r < INIT_ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this.grid.set(cellKey(r, c), randColor());
      }
    }
    this.score = 0;
    this.misses = 0;
    this.gameOver = false;
    this.clearedAll = false;
    this.projectile = null;
    this.currentColor = randColor();
    this.nextColor = randColor();
    this.aimAngle = Math.PI / 2;
  }

  setAimFromPoint(px: number, py: number): void {
    const dx = px - this.shooterX;
    const dy = this.shooterY - py;
    let a = Math.atan2(dy, dx);
    if (!Number.isFinite(a)) a = Math.PI / 2;
    if (a < ANGLE_MIN) a = ANGLE_MIN;
    if (a > ANGLE_MAX) a = ANGLE_MAX;
    this.aimAngle = a;
  }

  shoot(): void {
    if (this.gameOver || this.projectile) return;
    const vx = Math.cos(this.aimAngle) * SPEED;
    const vy = -Math.sin(this.aimAngle) * SPEED;
    this.projectile = {
      x: this.shooterX,
      y: this.shooterY,
      vx,
      vy,
      color: this.currentColor,
    };
  }

  endShotCycle(eliminated: boolean): void {
    this.currentColor = this.nextColor;
    this.nextColor = randColor();
    this.projectile = null;
    if (!eliminated) {
      this.misses++;
      if (this.misses >= MISS_LIMIT) {
        this.pushCeiling();
        this.misses = 0;
      }
    } else {
      this.misses = 0;
    }
    this.checkGameOver();
    if (this.grid.size === 0) {
      this.clearedAll = true;
      this.gameOver = true;
    }
  }

  pushCeiling(): void {
    const next: BubbleGrid = new Map();
    for (const [k, col] of this.grid) {
      const [r, c] = parseKey(k);
      const nk = cellKey(r + 1, c);
      next.set(nk, col);
    }
    this.grid = next;
    for (let c = 0; c < COLS; c++) {
      this.grid.set(cellKey(0, c), randColor());
    }
  }

  findCluster(startR: number, startC: number, color: number): Set<string> {
    const sk = cellKey(startR, startC);
    if (!this.grid.has(sk) || this.grid.get(sk) !== color) return new Set();
    const seen = new Set<string>([sk]);
    const q: [number, number][] = [[startR, startC]];
    while (q.length) {
      const [r, c] = q.pop()!;
      for (const [nr, nc] of neighbors(r, c)) {
        const nk = cellKey(nr, nc);
        if (seen.has(nk)) continue;
        if (this.grid.get(nk) === color) {
          seen.add(nk);
          q.push([nr, nc]);
        }
      }
    }
    return seen;
  }

  findAttached(): Set<string> {
    const attached = new Set<string>();
    const q: [number, number][] = [];
    for (let c = 0; c < COLS; c++) {
      const k = cellKey(0, c);
      if (this.grid.has(k)) {
        attached.add(k);
        q.push([0, c]);
      }
    }
    while (q.length) {
      const [r, c] = q.shift()!;
      for (const [nr, nc] of neighbors(r, c)) {
        const nk = cellKey(nr, nc);
        if (attached.has(nk)) continue;
        if (this.grid.has(nk)) {
          attached.add(nk);
          q.push([nr, nc]);
        }
      }
    }
    return attached;
  }

  removeFloating(): number {
    const attached = this.findAttached();
    let removed = 0;
    for (const k of [...this.grid.keys()]) {
      if (!attached.has(k)) {
        this.grid.delete(k);
        removed++;
      }
    }
    return removed;
  }

  checkGameOver(): void {
    for (const k of this.grid.keys()) {
      const [r, c] = parseKey(k);
      const cy = this.cellCenter(r, c).y;
      if (cy + this.R >= this.dangerY) {
        this.gameOver = true;
        return;
      }
    }
  }

  /** Returns true if any match-3+ was cleared (including floaters). */
  resolvePlacement(placeR: number, placeC: number): boolean {
    const color = this.grid.get(cellKey(placeR, placeC));
    if (color === undefined) return false;
    const cluster = this.findCluster(placeR, placeC, color);
    if (cluster.size < 3) return false;
    for (const k of cluster) this.grid.delete(k);
    const bonus = this.removeFloating();
    this.score += cluster.size * 10 + bonus * 15;
    return true;
  }

  findNearestEmptySlot(px: number, py: number, maxRow = 4): [number, number] | null {
    let best: [number, number] | null = null;
    let bestD = Infinity;
    for (let r = 0; r <= maxRow; r++) {
      for (let c = 0; c < COLS; c++) {
        const k = cellKey(r, c);
        if (this.grid.has(k)) continue;
        const touchTop = r === 0;
        const touchesBubble = neighbors(r, c).some(([nr, nc]) =>
          this.grid.has(cellKey(nr, nc)),
        );
        if (!touchTop && !touchesBubble) continue;
        const p = this.cellCenter(r, c);
        const d = dist(px, py, p.x, p.y);
        if (d < bestD) {
          bestD = d;
          best = [r, c];
        }
      }
    }
    return best;
  }

  pickAttachCell(
    hitR: number,
    hitC: number,
    px: number,
    py: number,
  ): [number, number] | null {
    const cands: [number, number][] = [];
    for (const [nr, nc] of neighbors(hitR, hitC)) {
      const nk = cellKey(nr, nc);
      if (!this.grid.has(nk)) cands.push([nr, nc]);
    }
    if (cands.length === 0) {
      const hk = cellKey(hitR, hitC);
      if (!this.grid.has(hk)) return [hitR, hitC];
      return null;
    }
    let best = cands[0]!;
    let bestD = Infinity;
    for (const [nr, nc] of cands) {
      const p = this.cellCenter(nr, nc);
      const d = dist(px, py, p.x, p.y);
      if (d < bestD) {
        bestD = d;
        best = [nr, nc];
      }
    }
    return best;
  }

  update(): void {
    this.pulseT += 0.05;
    if (!this.projectile || this.gameOver) return;
    const { R } = this;
    const left = this.marginX + R;
    const right = this.marginX + this.gridWidth;

    for (let i = 0; i < 6; i++) {
      const shot: ProjectileState | null = this.projectile;
      if (!shot) return;
      let lx: number = shot.x;
      let ly: number = shot.y;
      let lvx: number = shot.vx;
      const lvy: number = shot.vy;
      const lcolor: number = shot.color;

      lx += lvx * (STEP / SPEED);
      ly += lvy * (STEP / SPEED);

      if (lx - R < left) {
        lx = left + R;
        lvx = Math.abs(lvx);
      } else if (lx + R > right) {
        lx = right - R;
        lvx = -Math.abs(lvx);
      }

      if (ly - R < this.marginY) {
        const slot = this.findNearestEmptySlot(lx, ly, 4);
        if (slot) {
          const [ar, ac] = slot;
          this.grid.set(cellKey(ar, ac), lcolor);
          const ok = this.resolvePlacement(ar, ac);
          this.endShotCycle(ok);
        } else {
          this.endShotCycle(false);
        }
        return;
      }

      let hit: { r: number; c: number; d: number } | null = null;
      for (const [k] of this.grid) {
        const [r, c] = parseKey(k);
        const cell = this.cellCenter(r, c);
        const d0 = dist(lx, ly, cell.x, cell.y);
        if (d0 < 2 * R - 1.2) {
          if (!hit || d0 < hit.d) hit = { r, c, d: d0 };
        }
      }

      if (hit) {
        let attach = this.pickAttachCell(hit.r, hit.c, lx, ly);
        if (!attach) attach = this.findNearestEmptySlot(lx, ly, 8);
        if (attach) {
          const [ar, ac] = attach;
          this.grid.set(cellKey(ar, ac), lcolor);
          const ok = this.resolvePlacement(ar, ac);
          this.endShotCycle(ok);
        } else this.endShotCycle(false);
        return;
      }

      this.projectile = { x: lx, y: ly, vx: lvx, vy: lvy, color: lcolor };
    }
  }
}

export const NEON_PALETTE = [
  "#ff2a6d",
  "#05d9e8",
  "#d1f500",
  "#c44cff",
  "#00ffc8",
  "#ff9e00",
] as const;
