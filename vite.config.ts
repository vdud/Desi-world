import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
	plugins: [sveltekit(), basicSsl()],
	server: {
		proxy: {
			'/parties': {
				target: 'http://127.0.0.1:1999',
				changeOrigin: true,
				ws: true,
				secure: false
			}
		}
	}
});
