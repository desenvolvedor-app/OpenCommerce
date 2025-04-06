/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl:
        process.env.NEXT_PUBLIC_APP_URL || 'https://open-commerce.vercel.app',
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/api', '/_next'],
            },
        ],
    },
    exclude: ['/admin/*', '/api/*', '/dashboard/*', '/auth/*'],
    // You can add more custom configurations here
    // such as priority and changefreq for specific routes
    generateIndexSitemap: false,
    outDir: 'public',
};
