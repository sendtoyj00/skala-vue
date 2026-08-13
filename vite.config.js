import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 🟢 [커스텀 추가 1] 로컬 개발 서버(Dev Server) 속성 제어
  server: {
    port: 3000, // 개발 서버의 네트워크 포트를 3000번으로 고정 명세
    open: true, // 프로세스 기동(npm run dev) 시 기본 웹 브라우저를 자동 실행
    proxy: {
      // 기상청 도로기상관측자료(apihub.kma.go.kr)는 Access-Control-Allow-Origin 헤더를 주지
      // 않아(curl로 실측 확인) 브라우저에서 직접 호출하면 CORS로 막힌다. 개발 중에는 이
      // 프록시로 우회한다. 정적 빌드 배포(dist/)에는 이 프록시가 없으므로 운영 환경에서는
      // 별도 서버리스 프록시가 필요하다 — src/api/client.js 주석 참조, [결정 필요]로 남는다.
      '/kma-api': {
        target: 'https://apihub.kma.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kma-api/, ''),
      },
    },
  },
  // 🟢 [커스텀 추가 2] 컴파일 완료된 산출물(Production Build) 사양 제어
  build: {
    outDir: 'dist', // 최종 정적 리소스(HTML, JS, CSS)가 저장될 출력 디렉토리명 지정
  },
})
