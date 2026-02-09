export async function load() {
	const paths = import.meta.glob('/src/lib/posts/*.md', { eager: true });

	const posts = Object.entries(paths)
		.map(([path, file]) => {
			const slug = path.split('/').pop()?.replace('.md', '');
			const metadata = (file as { metadata: any }).metadata;
			return {
				slug,
				...metadata
			};
		})
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return { posts };
}
