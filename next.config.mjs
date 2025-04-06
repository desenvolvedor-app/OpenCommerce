/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['undici', 'firebase', '@firebase/auth'],
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Robots-Tag',
                        value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },
    trailingSlash: false,
    images: {
        dangerouslyAllowSVG: true,
        contentSecurityPolicy:
            "default-src 'self'; img-src 'self' https://firebasestorage.googleapis.com https://picsum.photos; script-src 'none'; sandbox;",
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                pathname: '/v0/b/**',
            },
            {
                protocol: 'https',
                hostname: 'sxkehf7bt4fkxchp.public.blob.vercel-storage.com',
                pathname: '/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/assets/:path*',
                destination: '/assets/:path*',
            },
        ];
    },
};

export default nextConfig;
