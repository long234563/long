(function (root) {
  'use strict';
  class DodgeEngine {
    constructor(random = Math.random) {
      this.random = random;
      this.width = 360;
      this.height = 720;
      this.reset();
      this.mode = 'ready';
    }
    reset() {
      this.x = this.width / 2;
      this.y = this.height - 115;
      this.radius = 12;
      this.target = this.x;
      this.time = 0;
      this.passed = 0;
      this.spawnIn = 1.1;
      this.obstacles = [];
      this.mode = 'playing';
    }
    get score() { return Math.floor(this.time * 10) + this.passed * 25; }
    get level() { return 1 + Math.floor(this.time / 15); }
    move(x) {
      this.target = Math.max(25, Math.min(this.width - 25, x));
    }
    pause() { if (this.mode === 'playing') this.mode = 'paused'; }
    resume() { if (this.mode === 'paused') this.mode = 'playing'; }
    tick(dt) {
      if (this.mode !== 'playing' || !Number.isFinite(dt) || dt <= 0) return;
      dt = Math.min(dt, 0.04);
      const oldX = this.x;
      this.x += Math.sign(this.target - this.x) * Math.min(Math.abs(this.target - this.x), 560 * dt);
      this.time += dt;
      this.spawnIn -= dt;
      if (this.spawnIn <= 0) {
        const radius = 15 + this.random() * 13;
        this.obstacles.push({
          x: radius + 7 + this.random() * (this.width - 2 * radius - 14),
          y: -radius - 10, radius,
          speed: Math.min(330, 150 + this.time * 2) + this.random() * 35,
          angle: this.random() * Math.PI * 2,
          spin: this.random() * 1.6 - 0.8
        });
        this.spawnIn = Math.max(0.45, 0.95 - this.time * 0.006);
      }
      for (const rock of this.obstacles) {
        const oldY = rock.y;
        rock.y += rock.speed * dt;
        rock.angle += rock.spin * dt;
        // Swept circle collision catches fast motion between consecutive frames.
        const dx = rock.x - oldX, dy = oldY - this.y;
        const vx = -(this.x - oldX), vy = rock.y - oldY;
        const length2 = vx * vx + vy * vy;
        const t = length2 ? Math.max(0, Math.min(1, -(dx * vx + dy * vy) / length2)) : 0;
        const reach = rock.radius + this.radius;
        if ((dx + vx * t) ** 2 + (dy + vy * t) ** 2 < reach ** 2) {
          this.mode = 'over';
          return;
        }
      }
      this.obstacles = this.obstacles.filter(rock => {
        if (rock.y - rock.radius > this.height) { this.passed++; return false; }
        return true;
      });
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = DodgeEngine;
  else root.DodgeEngine = DodgeEngine;
})(typeof window !== 'undefined' ? window : globalThis);
