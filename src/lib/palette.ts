export const ASSET_PALETTE = [
  "#047857", // emerald
  "#0369a1", // sky
  "#7c3aed", // violet
  "#db2777", // pink
  "#ea580c", // orange
  "#ca8a04", // amber
  "#65a30d", // lime
  "#475569", // slate
];

export function colorForIndex(i: number): string {
  return ASSET_PALETTE[i % ASSET_PALETTE.length];
}
