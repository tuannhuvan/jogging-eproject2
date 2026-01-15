import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Loader path from orchids-visual-edits - use direct resolve to get the actual file
const loaderPath = require.resolve('orchids-visual-edits/loader.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    minimumCacheTTL: 60,
    unoptimized: true,
  },
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  eslint: {
    ignoreDuringBuilds: true,
  },
  /*
  turbopack: {
    rules: {
      "*.{jsx,js}": {
        loaders: [loaderPath]
      }
    }
  }
  */
};

export default nextConfig;
