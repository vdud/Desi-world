// Helper to escape XML special characters
function escapeXml(unsafe: string): string {
	return unsafe.replace(/[<>&'"]/g, (c) => {
		switch (c) {
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '&':
				return '&amp;';
			case "'":
				return '&apos;';
			case '"':
				return '&quot;';
			default:
				return c;
		}
	});
}

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

	// Combine all paths & clean
	const allPaths = [...pages, ...blogPages].map((p) => p.trim());

	// Generate XML
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
	.map((path) => {
		const loc = escapeXml(`${site}${path}`);
		return `
	<url>
		<loc>${loc}</loc>
		<changefreq>daily</changefreq>
		<priority>0.7</priority>
	</url>`;
	})
	.join('')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
}
