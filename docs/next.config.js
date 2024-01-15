const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  latex: true,
});

module.exports = {
  ...withNextra(),
  async redirects() {
    return [
      {
        source: "/",
        destination: "/portal",
        permanent: true,
      },
      {
        source: "/portal",
        destination: "/portal/getting-started",
        permanent: true,
      },
      {
        source: "/atom",
        destination: "/atom/introduction",
        permanent: true,
      },
      {
        source: "/atom/events",
        destination: "/atom/events/overview",
        permanent: true,
      },
      {
        source: "/atom/create-builder",
        destination: "atom/create-builder/construct",
        permanent: true,
      }
    ];
  },
};
