export async function GET() {
	const site = 'https://root0.vercel.app'; // Replace with your actual domain

	// 1. Static Pages (Manually listed)
	const pages = [
		'',
		'/play',
		'/blog',
		'/marketplace',
		'/about',
		'/community',
		'/how-it-works',
		'/world',
		'/roadmap',
		'/faq',
		'/privacy-policy',
		'/terms-of-service',
		'/cookie-policy',
		'/community-guidelines'
	];

	// 2. Dynamic Blog Posts
	const posts = import.meta.glob('/src/lib/posts/*.md', { eager: true });
	const blogPages = Object.entries(posts).map(([path, file]) => {
		// path is like /src/lib/posts/my-post.md
		// slug comes from filename (or metadata if you prefer)
		const slug = path.split('/').pop()?.replace('.md', '');
		return `/blog/${slug}`;
	});

	// Combine all paths
	const allPaths = [...pages, ...blogPages];

	// Generate XML
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
	.map((path) => {
		return `
	<url>
		<loc>${site}${path}</loc>
		<changefreq>daily</changefreq>
		<priority>0.7</priority>
	</url>`;
	})
	.join('')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
}
