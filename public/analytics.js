import { inject } from '/vendor/vercel-analytics.js';

if (navigator.globalPrivacyControl !== true && navigator.doNotTrack !== '1') {
  inject({
    mode: 'production',
    beforeSend(event) {
      const url = new URL(event.url);
      url.search = '';
      url.hash = '';
      return { ...event, url: url.href };
    }
  });
}
