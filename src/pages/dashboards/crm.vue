<script setup>
import CrmCustomerTable from '@/views/dashboard/crm/CrmCustomerTable.vue'
import CrmEarningReport from '@/views/dashboard/crm/CrmEarningReport.vue'
import CrmTeamMembers from '@/views/dashboard/crm/CrmTeamMembers.vue'
import CrmTopProducts from '@/views/dashboard/crm/CrmTopProducts.vue'
</script>

<template>
  <VRow>
    <!-- 👉 Top Products -->
    <VCol
      cols="12"
      lg="8"
    >
      <CrmTopProducts />
    </VCol>

    <!-- 👉 Earning Report -->
    <VCol
      cols="12"
      sm="6"
      lg="4"
    >
      <CrmEarningReport />
    </VCol>

    <!-- 👉 Team Members -->
    <VCol
      cols="12"
      md="5"
    >
      <CrmTeamMembers />
    </VCol>

    <!-- 👉 Customer Table -->
    <VCol
      cols="12"
      md="7"
    >
      <CrmCustomerTable />
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
</style>
