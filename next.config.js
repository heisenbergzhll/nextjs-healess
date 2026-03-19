/** @type {import('next').NextConfig} */
// @ts-ignore
const { i18n } = require('./next-i18next.config');
const path = require('path');

const nextConfig = {
  i18n,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.haitaoweb.com',
        port: '',
        pathname: '/**',
      }
    ]
  },
  env: {
    MAGENTO_ENDPOINT: process.env.MAGENTO_ENDPOINT,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Store, Authorization',
          },
        ],
      },
      {
        source: '/api/graphql',
        headers: [
          { key: 'Vary', value: 'Accept-Encoding, Store, Authorization' },
          {
            key: 'Cache-Control',
            value:
              'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/catalog/product/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=10, stale-while-revalidate=59',
          },
          { key: 'CDN-Cache-Control', value: 'public, s-maxage=10' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  compiler: {
    removeConsole:
      process.env.MODE?.toLocaleLowerCase() === 'production' ? true : false,
  },
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': path.resolve(__dirname),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    };

    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      loader: 'graphql-tag/loader',
    });
    return config;
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:pathname.html',
          destination: '/cmsPages/:pathname*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
