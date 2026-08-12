// 온도 단위 변환 순수 함수. Vue를 모른다. (vue_architecture.md 5.2)

export function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32)
}
