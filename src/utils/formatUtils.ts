/**
 * パラメータ値を表示用にフォーマット
 */
export function formatParameterDisplay(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  return String(value);
}
