import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = process.env.NEXT_DIST_DIR?.trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(distDir ? { distDir } : {}),
  async redirects() {
    // Gom www về domain chính để Google chỉ index một phiên bản của site.
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.srx.vn' }],
        destination: 'https://srx.vn/:path*',
        permanent: true,
      },
    ];
  },
  webpack(config) {
    config.resolve.alias['react-router-dom'] = path.resolve(
      __dirname,
      'src/lib/react-router-dom-compat.js'
    );

    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });

    return config;
  },
};

export default nextConfig;
