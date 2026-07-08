/**
 * MoneyFlow sementara hard-code WIB (UTC+7) untuk semua batas "hari ini", "minggu ini", dst.
 * Perhitungan pakai math epoch murni (bukan Date.setHours lokal) supaya hasilnya konsisten
 * tidak peduli server Vercel jalan di timezone apa (biasanya UTC).
 */
export const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Ambil komponen tanggal (tahun/bulan/hari/hari-dlm-minggu) versi WIB dari sebuah instant. */
export function getWIBParts(date: Date = new Date()) {
  const shifted = new Date(date.getTime() + WIB_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(), // 0-11
    day: shifted.getUTCDate(), // 1-31
    weekday: shifted.getUTCDay(), // 0=Minggu
  };
}

/** Bangun instant UTC yang merepresentasikan jam dinding WIB tertentu. */
export function wibToUTC(year: number, month: number, day: number, hours = 0, minutes = 0, seconds = 0, ms = 0) {
  return new Date(Date.UTC(year, month, day, hours, minutes, seconds, ms) - WIB_OFFSET_MS);
}

/** Instant UTC untuk jam 00:00:00 WIB pada "hari ini + offsetDays". */
export function startOfWIBDay(offsetDays = 0, reference: Date = new Date()) {
  const { year, month, day } = getWIBParts(reference);
  return wibToUTC(year, month, day + offsetDays, 0, 0, 0, 0);
}

/** Instant UTC untuk jam 23:59:59.999 WIB pada "hari ini + offsetDays". */
export function endOfWIBDay(offsetDays = 0, reference: Date = new Date()) {
  const { year, month, day } = getWIBParts(reference);
  return wibToUTC(year, month, day + offsetDays, 23, 59, 59, 999);
}
