// v-glow-tilt — 대시보드 카드용 마우스 트래킹 효과. 커서 위치를 따라가는 스포트라이트
// 그라디언트(--mx/--my)와 미세한 3D 기울임을 준다(참조 이미지의 프로스트 글래스 카드가
// 빛을 받아 반짝이는 느낌). 색상 토큰은 건드리지 않고 위치·각도만 계산하는 순수 DOM
// 이펙트라 base.css의 4색 팔레트 규칙과 무관하다.
//
// 사용하는 요소는 CSS에서 .tilt-glow 클래스(base.css)로 스타일을 받는다 — 이 디렉티브는
// mounted 시 그 클래스를 붙이고 mousemove/leave만 관리한다.
const MAX_TILT_DEG = 5

function attach(el) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const onMove = (e) => {
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)

    if (prefersReducedMotion) return
    const rotY = (px - 0.5) * MAX_TILT_DEG * 2
    const rotX = (0.5 - py) * MAX_TILT_DEG * 2
    el.style.transform = `perspective(700px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-2px)`
  }
  const onEnter = () => el.classList.add('is-active')
  const onLeave = () => {
    el.classList.remove('is-active')
    el.style.transform = ''
  }

  el.classList.add('tilt-glow')
  el.addEventListener('mouseenter', onEnter)
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseleave', onLeave)

  el.__glowTiltCleanup = () => {
    el.removeEventListener('mouseenter', onEnter)
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
  }
}

export const glowTilt = {
  mounted(el) {
    attach(el)
  },
  unmounted(el) {
    el.__glowTiltCleanup?.()
  },
}
