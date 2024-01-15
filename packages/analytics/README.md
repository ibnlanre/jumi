# Analytics

Track user interactions, clicks, scrolls, and hotspots on your website with our lightweight and versatile analytics library. Gain valuable insights into user behavior to optimize your web content and enhance the user experience.

## Installation

```bash
# NPM
npm install --save @ibnlanre/analytics

# Yarn
yarn add @ibnlanre/analytics
```

## API

```typescript
import Analytics from "@ibnlanre/analytics";

const analytics = new Analytics({
  api: "https://..."
});

// Track
analytics.track();

// Track Links
analytics.trackLinks();

// Track Forms
analytics.trackForms();
```
