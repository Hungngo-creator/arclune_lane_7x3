// bump version để ép cập nhật
const CACHE = "tapfly-v11";
const ASSETS = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", e => {
  // cài xong kích hoạt ngay
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", e => {
  e.waitUntil(Promise.all([
    // xoá cache cũ
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ),
    // chiếm quyền tab hiện tại
    self.clients.claim()
  ]));
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r =>
      r ||
      fetch(e.request).then(net => {
        const copy = net.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
        return net;
      }).catch(() => r) // offline thì trả cache nếu có
    )
  );
});
