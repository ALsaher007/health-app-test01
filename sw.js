const CACHE = "aburaslan-fit-v13"; // keep in sync with CACHE_NAME in src/config.js
const SHELL = [
  "./", "./index.html", "./manifest.json",
  // icons are requested with ?v=2, and cache.match() is exact about the query string
  "./icon-192.png?v=2", "./icon-512.png?v=2", "./bell-192.png", "./badge-96.png",
  "./src/app.js", "./src/config.js", "./src/state.js",
  "./src/data/foods.js", "./src/data/gas-template.js", "./src/data/nutrition-constants.js", "./src/data/prayers.js", "./src/data/programs.js", "./src/data/swaps.js",
  "./src/logic/alarms.js", "./src/logic/nutrition.js", "./src/logic/programs.js", "./src/logic/reports.js", "./src/logic/schedule.js", "./src/logic/storage.js", "./src/logic/telegram.js",
  "./src/ui/actions.js", "./src/ui/body-goals.js", "./src/ui/dom.js", "./src/ui/meal-editor.js", "./src/ui/modals.js", "./src/ui/program-manager.js", "./src/ui/render-all.js", "./src/ui/render-header.js", "./src/ui/render-meals.js", "./src/ui/render-nutrition.js", "./src/ui/render-prayers.js", "./src/ui/render-stats.js", "./src/ui/render-tasks.js", "./src/ui/render-water.js", "./src/ui/render-weight.js", "./src/ui/toast.js"
];

self.addEventListener("install", e => {
  // allSettled: after a Vite build the src/* paths are bundled, so a missing file must not fail the install
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// الشبكة أولاً (حتى توصلك التحديثات)، وإذا ما في نت بيفتح من الكاش
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});

// الضغط على الإشعار بيفتح التطبيق أو بيرجّعك إله
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const c of list) { if ("focus" in c) return c.focus(); }
      return self.clients.openWindow("./");
    })
  );
});
