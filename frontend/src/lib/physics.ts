export function newtonAccel(forceN: number, massKg: number): number {
  if (!Number.isFinite(forceN) || !Number.isFinite(massKg) || massKg <= 0) {
    return 0;
  }
  return forceN / massKg;
}

export function withinGoal(actual: number, value: number, tolerance: number): boolean {
  return Math.abs(actual - value) <= tolerance;
}
