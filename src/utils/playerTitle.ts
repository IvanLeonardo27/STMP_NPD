/**
 * Logika penentuan Gelar Pemain berdasarkan jumlah katak yang berhasil diseberangkan
 * 
 * Aturan Gelar (Sesuai Ketentuan UTS Froggy Crosser):
 * - >= 5 Katak : Apex Amphibian
 * - 4 Katak    : Highway Navigator
 * - 3 Katak    : Agile Hopper
 * - 2 Katak    : Pond Explorer
 * - 1 Katak    : Daring Tadpole
 * - 0 Katak    : Unlucky Amphibian
 */

export interface PlayerTitleInfo {
  title: string;
  badge: string;
  color: string;
  description: string;
}

export function getPlayerTitle(frogsSaved: number): string {
  if (frogsSaved >= 5) return 'Apex Amphibian';
  if (frogsSaved === 4) return 'Highway Navigator';
  if (frogsSaved === 3) return 'Agile Hopper';
  if (frogsSaved === 2) return 'Pond Explorer';
  if (frogsSaved === 1) return 'Daring Tadpole';
  return 'Unlucky Amphibian';
}

export function getPlayerTitleInfo(frogsSaved: number): PlayerTitleInfo {
  if (frogsSaved >= 5) {
    return {
      title: 'Apex Amphibian',
      badge: '👑',
      color: '#ffd700', // Emas
      description: 'Luar biasa! 5 atau lebih katak berhasil selamat!',
    };
  }
  if (frogsSaved === 4) {
    return {
      title: 'Highway Navigator',
      badge: '🚗',
      color: '#00d2ff', // Cyan / Biru terang
      description: 'Hebat! 4 katak berhasil menyeberang dengan aman.',
    };
  }
  if (frogsSaved === 3) {
    return {
      title: 'Agile Hopper',
      badge: '⚡',
      color: '#52c41a', // Hijau gesit
      description: 'Lincah dan tangkas! 3 katak berhasil diseberangkan.',
    };
  }
  if (frogsSaved === 2) {
    return {
      title: 'Pond Explorer',
      badge: '🌊',
      color: '#1890ff', // Biru laut
      description: 'Penjelajah yang baik! 2 katak berhasil sampai ke tujuan.',
    };
  }
  if (frogsSaved === 1) {
    return {
      title: 'Daring Tadpole',
      badge: '🐸',
      color: '#a0d911', // Hijau muda
      description: 'Permulaan yang berani! 1 katak berhasil diselamatkan.',
    };
  }
  return {
    title: 'Unlucky Amphibian',
    badge: '💀',
    color: '#ff4d4f', // Merah
    description: 'Belum beruntung! Belum ada katak yang berhasil diseberangkan.',
  };
}
