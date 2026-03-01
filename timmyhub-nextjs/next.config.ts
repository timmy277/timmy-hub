import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
    /* React Compiler - Automatic optimization */
    reactCompiler: true,

    /* Performance Optimizations */
    compress: true, // Enable gzip compression
    poweredByHeader: false, // Security: Hide X-Powered-By header

    /* Image Optimization */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'duxwhtfvahbpvptvkegb.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
        ],
        formats: ['image/avif', 'image/webp'], // Modern formats first
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60, // Cache images for 60 seconds
    },

    /* Experimental Features */
    experimental: {
        optimizePackageImports: ['@mantine/core', '@mantine/hooks', '@tabler/icons-react'],
    },

    /* Bundle Analyzer - Enable with ANALYZE=true */
    ...(process.env.ANALYZE === 'true' && {
        webpack: (config: Configuration) => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
            config.plugins = config.plugins || [];
            config.plugins.push(
                new BundleAnalyzerPlugin({
                    analyzerMode: 'static',
                    openAnalyzer: true,
                    reportFilename: './analyze.html',
                }),
            );
            return config;
        },
    }),
};

export default nextConfig;
