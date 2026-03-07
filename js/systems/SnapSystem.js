/**
 * NOVA Engine — SnapSystem
 * Manages grid snap state.
 */

export class SnapSystem {
  constructor() {
    this.enabled   = false;
    this.gridSize  = 0.5;   // metres
    this.rotDeg    = 15;    // degrees
    this.scaleFrac = 0.25;
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  snap(value) {
    if (!this.enabled) return value;
    return Math.round(value / this.gridSize) * this.gridSize;
  }

  getLabel() {
    return `Snap: ${this.gridSize}m`;
  }
}
