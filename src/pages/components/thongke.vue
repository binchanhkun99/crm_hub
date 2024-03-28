<script setup>
import request from "@/utils/request";
import { onMounted, ref } from "vue";
const dataThongKeUser = ref();
const apiKey = ref();
const user_count_last_7_days = ref();
const user_growth_percentage = ref();
const revenue_last_7_days = ref()
const revenue_growth_percentage = ref()
const getThongKeUser = async () => {
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&action=get_user_count_and_revenue`
    )
    .then((res) => {
      user_count_last_7_days.value = res.data.data.user_count_last_7_days;
      user_growth_percentage.value = res.data.data.user_growth_percentage.toFixed(3);
      revenue_last_7_days.value = res.data.data.revenue_last_7_days;
      revenue_growth_percentage.value = res.data.data.revenue_growth_percentage.toFixed(3);

      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};

onMounted(() => {
  getThongKeUser();
});
</script>
<template>
  <VCol cols="12" sm="6" lg="3">
    <VCard>
      <VCardText class="d-flex justify-space-between">
        <div>
          <span>Người dùng đăng ký mới</span>
          <div class="d-flex align-center gap-2">
            <h6 class="text-h6">
              {{ user_count_last_7_days }}
            </h6>
            <span
              :class="
                user_growth_percentage > 0 ? 'text-success' : 'text-error'
              "
              class="text-sm"
              >({{ user_growth_percentage }}%)</span
            >
          </div>
          <span class="text-sm">7 ngày gần nhất</span>
        </div>

        <VAvatar rounded variant="tonal" color="primary" icon="bx-user" />
      </VCardText>
    </VCard>
  </VCol>
  <VCol cols="12" sm="6" lg="3">
    <VCard>
      <VCardText class="d-flex justify-space-between">
        <div>
          <span>Doanh thu</span>
          <div class="d-flex align-center gap-2">
            <h6 class="text-h6">
              {{ revenue_last_7_days }}
            </h6>
            <span
              :class="
                revenue_growth_percentage > 0 ? 'text-success' : 'text-error'
              "
              class="text-sm"
              >({{ revenue_growth_percentage }}%)</span
            >
          </div>
          <span class="text-sm">7 ngày gần nhất</span>
        </div>

        <VAvatar rounded variant="tonal" color="primary" icon="bx-wallet" />
      </VCardText>
    </VCard>
  </VCol>
</template>
<style lang="scss"></style>
