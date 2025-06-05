

self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('.mp4')) {
    event.respondWith(
      caches.open('video-cache').then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            return response;
          }

          return fetch(event.request).then((networkResponse) => {
            if (
              networkResponse.status === 200 &&
              networkResponse.type === 'basic'
            ) {
              cache.put(event.request, networkResponse.clone());
            }

            return networkResponse;
          });
        });
      })
    );
  }
});
