// eslint-disable-next-line no-console

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Lấy các biến môi trường từ tệp .env
  // `loadEnv` sẽ tự động tải các file .env phù hợp với chế độ (mode) hiện tại
  const env = loadEnv(mode, process.cwd(), '');

  // Chạy lệnh console.log ở đây
  console.log('--- Vite Dev Server đã khởi động ---');
  console.log('Command:', command);
  console.log('Mode:', mode);
  console.log('---');
  console.log(`Specialized API: ${env.VITE_SPECIALIZED_API_URL}`);

  return {
    plugins: [react()],
    server: {
      cors: {
        origin: ['https://api.toolhub.app', 'https://api1.techlinkvn.com:2999'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type']
      },
      allowedHosts: ['tool.com'] // Đã bỏ dấu chấm phẩy thừa ở đây
    } // Không có dấu chấm phẩy ở đây
  };
});