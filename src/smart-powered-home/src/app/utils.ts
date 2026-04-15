export function getHour(time: string): number {
  return parseInt(time.split(':')[0], 10);
}
