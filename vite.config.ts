import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  	plugins: [react()],
  	base: '/SerialCommander/', // = './' nếu muốn sử dụng đường dẫn tương đối  
  	server: {
		cors: {
			origin: ['HTTP://serialcommander.com:5173', 'http://localhost:5173'],
			methods: ['GET', 'POST'],
			allowedHeaders: ['Content-Type']
		},
		allowedHosts: ['serialcommander.com'] //added this
  }
})
