// Consent-gated functionality (analytics, martech). Loaded by consent-check.js after consent.
import siteConfig from './site-config.js';

function loadTags({ enabled, launchUrl }) {
  if (!enabled || !launchUrl) return;
  window.adobeDataLayer = window.adobeDataLayer || [];
  const script = document.createElement('script');
  script.src = launchUrl;
  script.async = true;
  document.head.append(script);
}

loadTags(siteConfig.tags);
