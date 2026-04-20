import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
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
