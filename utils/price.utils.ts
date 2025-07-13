export function formatPrice(price: number): string {
  return price < 0.0001
    ? price.toLocaleString(undefined, {
        minimumFractionDigits: 8,
      })
    : price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      });
}

export function formatVolume(volume: number): string {
  return volume < 1
    ? volume.toLocaleString(undefined, {
        minimumFractionDigits: 4,
      })
    : volume.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
}
