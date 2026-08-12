<script setup>
// 날씨 추천 뱃지 전용 컴포넌트: 기온/습도/바람으로 온도감 + 활동 추천 문구를 계산해서 보여준다
defineProps({
  status: {
    type: String,
    required: true,
  },
  temp: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  windSpeed: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <span v-if="temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
  <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>

  <span v-if="status === '폭우' && windSpeed >= 50" class="badge recommend-rain">🌊 폭우+강풍 동시 발생! 외출을 삼가세요.</span>
  <span v-else-if="status === '폭우'" class="badge recommend-rain">🌧️ 폭우가 예상되니 외출을 자제해주세요.</span>
  <span v-else-if="windSpeed >= 50 && temp >= 30" class="badge recommend-wind">🌪️🔥 강풍+고온 동시! 열사병과 낙하물 모두 주의하세요.</span>
  <span v-else-if="windSpeed >= 50" class="badge recommend-wind">🌪️ 강풍이 불고 있어 야외 활동을 피해주세요.</span>
  <span v-else-if="temp >= 30 && humidity >= 70" class="badge recommend-overhit">🥵 고온다습! 체감온도가 더 높으니 수분 섭취에 유의하세요.</span>
  <span v-else-if="temp >= 30" class="badge recommend-overhit">🔥 기온이 높으니 더위에 주의하세요.</span>
  <span v-else class="badge recommend">🍃 산책하기 좋은 날씨예요!</span>
</template>
