export function calculateNextPosition(current: { x: number; y: number }): { x: number; y: number } {
  return { x: current.x + 200, y: current.y };
}
