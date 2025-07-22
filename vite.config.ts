import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'process'
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Đọc package.json để đưa các tham số vào môi trường của vite
const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

// https://vite.dev/config/
export default defineConfig({
  	plugins: [react()],
  	base: './', // = './' nếu muốn sử dụng đường dẫn tương đối  
  	server: {
		cors: {
			origin: ['HTTP://serialcommander.com:5173', 'http://localhost:5173'],
			methods: ['GET', 'POST'],
			allowedHeaders: ['Content-Type']
		},
		allowedHosts: ['serialcommander.com'] //added this
  },
  define: {
    // Cách xử lý của vite: tham số từ package.json phải đẩy vào thành số của vite, rồi mới được sử dụng khi tiền biên dịch.
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
    'import.meta.env.VITE_APP_NAME': JSON.stringify(packageJson.title || packageJson.name),
  },  
})
