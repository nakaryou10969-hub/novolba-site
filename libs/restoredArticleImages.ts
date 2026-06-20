export const RESTORED_NEWS_BODY_IMAGES: Record<string, string[]> = {
  hzv7lpuw4lx: [
    "https://novolba.com/wp-restored-assets/cdn.peatix.com/event/4591590/cover-wjeoGgNkBne9uJ6CKbOOacunGSTkLrju.jpeg",
    "https://novolba.com/wp-restored-assets/cdn.peatix.com/event/4591590/cover-EOkyGu6biIXhfKbavcbuyV5Bw5A7DGaY.jpeg",
    "https://novolba.com/wp-restored-assets/cdn.peatix.com/event/4591590/cover-dbRmMaYYRZ43oXMHGFW6IPBPAum5k9bP.jpeg",
    "https://novolba.com/wp-restored-assets/cdn.peatix.com/event/4591590/cover-VuH90i2BGN8uM7hjMh50iXcdXKESMAtH.jpeg",
  ],
  yb6a05xo8w: [
    "https://novolba.com/wp-restored-assets/cdn.peatix.com/event/4591590/cover-wjeoGgNkBne9uJ6CKbOOacunGSTkLrju.jpeg",
    "https://novolba.com/wp-restored-assets/cdn.peatix.com/event/4591590/cover-EOkyGu6biIXhfKbavcbuyV5Bw5A7DGaY.jpeg",
    "https://novolba.com/wp-restored-assets/cdn.peatix.com/event/4591590/cover-dbRmMaYYRZ43oXMHGFW6IPBPAum5k9bP.jpeg",
    "https://novolba.com/wp-restored-assets/cdn.peatix.com/event/4591590/cover-VuH90i2BGN8uM7hjMh50iXcdXKESMAtH.jpeg",
  ],
  p3nvz22037uq: [
    "https://novolba.com/wp-restored-assets/cdn.peatix.com/event/4591590/cover-wjeoGgNkBne9uJ6CKbOOacunGSTkLrju.jpeg",
    "https://novolba.com/wp-restored-assets/cdn.peatix.com/event/4591590/cover-EOkyGu6biIXhfKbavcbuyV5Bw5A7DGaY.jpeg",
    "https://novolba.com/wp-restored-assets/cdn.peatix.com/event/4591590/cover-dbRmMaYYRZ43oXMHGFW6IPBPAum5k9bP.jpeg",
    "https://novolba.com/wp-restored-assets/cdn.peatix.com/event/4591590/cover-VuH90i2BGN8uM7hjMh50iXcdXKESMAtH.jpeg",
  ],
  lh5vk4llauee: [
    "https://novolba.com/wp-restored-assets/cdn.pixabay.com/photo/2018/03/10/12/00/paper-3213924__340.jpg",
  ],
};

export function getRestoredNewsBodyImages(id: string) {
  return RESTORED_NEWS_BODY_IMAGES[id] ?? [];
}
