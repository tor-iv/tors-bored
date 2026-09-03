export function formatSkuDisplay(sku: string): string {
  return sku.toUpperCase();
}

export function parseSkuType(sku: string): string {
  return sku.split('-')[0] ?? '';
}

export function parseSkuYear(sku: string): number {
  return parseInt(sku.split('-')[1] ?? '0', 10);
}

export function parseSkuSeq(sku: string): number {
  return parseInt(sku.split('-')[2] ?? '0', 10);
}
