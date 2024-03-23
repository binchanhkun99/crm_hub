<script setup>
import EcommerceTable from '@/views/dashboard/ecommerce/EcommerceTable.vue'
import EcommerceTotalBalance from '@/views/dashboard/ecommerce/EcommerceTotalBalance.vue'
</script>

<template>
  <VRow>

    <!-- 👉 Table -->
    <VCol
      cols="12"
      md="8"
    >
      <EcommerceTable />
    </VCol>

    <!-- 👉 Total Balance -->
    <VCol
      cols="12"
      md="4"
    >
      <EcommerceTotalBalance />
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>
