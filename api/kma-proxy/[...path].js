// 기상청 도로기상관측자료(apihub.kma.go.kr)는 CORS 헤더를 주지 않아 브라우저에서 직접 호출이
// 막힌다(src/api/client.js 주석 참조). 이 Vercel 서버리스 함수가 서버-서버로 대신 호출해
// 브라우저에는 같은 오리진(/api/kma-proxy/...)으로 응답한다 — 서버 간 호출은 CORS 대상이 아니다.
// authKey는 여기서 서버 측 process.env로 주입하므로, 클라이언트가 보낸 값은 무시하고 덮어쓴다.
export default async function handler(req, res) {
  try {
    const { path, ...query } = req.query
    const segments = Array.isArray(path) ? path : path ? [path] : []
    const upstreamPath = segments.join('/')

    const params = new URLSearchParams(query)
    params.set('authKey', process.env.VITE_KMA_AUTH_KEY ?? '')

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
