const CACHE = 'schetchiki-v1';
const ASSETS = ['/', '/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/index.html')))
  );
});

// Notifications: check daily
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});

// Called from main app to schedule reminder
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_REMINDER') {
    // Store reminder info
  }
});

// Periodic check for deadlines
self.addEventListener('periodicsync', e => {
  if (e.tag === 'deadline-check') {
    e.waitUntil(checkDeadlines());
  }
});

async function checkDeadlines() {
  const day = new Date().getDate();
  const msgs = [];
  if (day === 20) msgs.push({ title: '⚡ ТЭК', body: 'Сегодня начинается приём показаний (до 25-го)' });
  if (day === 15) msgs.push({ title: '🌊 ЭнергосбыТ Плюс', body: 'Сегодня начинается приём показаний (до 25-го)' });
  if (day === 24) msgs.push({ title: '📊 Счётчики — завтра последний день!', body: 'Не забудьте передать показания до 25-го числа' });
  for (const m of msgs) {
    await self.registration.showNotification(m.title, {
      body: m.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    });
  }
}
