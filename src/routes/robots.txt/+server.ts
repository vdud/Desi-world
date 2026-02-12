export const prerender = true;

export async function GET() {
	const site = 'https://root0.vercel.app'; // Replace with your actual domain

	const robots = `
User-agent: *
Allow: /

Sitemap: ${site}/sitemap.xml
`;

	return new Response(robots.trim(), {
		headers: {
			'Content-Type': 'text/plain'
		}
	});
}
