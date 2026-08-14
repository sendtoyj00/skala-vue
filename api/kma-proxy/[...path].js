// 기상청 도로기상관측자료(apihub.kma.go.kr)는 CORS 헤더를 주지 않아 브라우저에서 직접 호출이
// 막힌다(src/api/client.js 주석 참조). 이 Vercel 서버리스 함수가 서버-서버로 대신 호출해
// 브라우저에는 같은 오리진(/api/kma-proxy/...)으로 응답한다 — 서버 간 호출은 CORS 대상이 아니다.
// authKey는 클라이언트가 보낸 값을 그대로 전달한다 — VITE_ 접두 변수는 애초에 빌드 번들에
// 그대로 노출되므로(client.js의 kmaClient 인터셉터) 서버 측에서 process.env로 다시 가리는 건
// 보안상 의미가 없고, Vercel 함수 런타임에 같은 값이 안 보일 때 별도 실패 지점만 늘렸다.
export default async function handler(req, res) {
  try {
    const { path, ...query } = req.query
    const segments = Array.isArray(path) ? path : path ? [path] : []
    const upstreamPath = segments.join('/')

    const params = new URLSearchParams(query)

    const upstreamRes = await fetch(`https://apihub.kma.go.kr/${upstreamPath}?${params}`)
    const buffer = Buffer.from(await upstreamRes.arrayBuffer())

    res.status(upstreamRes.status)
    res.setHeader('Content-Type', 'text/plain; charset=euc-kr')
    res.setHeader('Cache-Control', 'no-store')
    res.send(buffer)
  } catch (err) {
    res.status(502).json({ error: 'kma_proxy_failed', message: err.message })
  }
}
