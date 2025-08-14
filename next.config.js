const path = require('path');

module.exports = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
    };
    return config;
  },
};
