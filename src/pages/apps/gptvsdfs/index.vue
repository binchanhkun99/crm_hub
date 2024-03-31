<script setup>
import request from "@/utils/request";
import { onMounted } from "vue";

import gpt from "@images/logos/gpt.png";
import dfs from "@images/logos/Stable_Diffusion_logo_2b68efd6c7.png";

const selectAI = ref();
const Resolution = ref();
const dataRole = JSON.parse(localStorage.getItem("user")) || {};
const role = ref();
role.value = dataRole.level;
// watch()
const apiKey = ref();
const fetchConfig = async () => {
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  const res = await request.get(
    `api/admin/index.php?key=${apiKey.value}&action=sd_get_settings`
  );
  if (res.data.status) {
    selectAI.value = res.data.data.redirect;
    Resolution.value = res.data.data.image_size;
  }
};
const loading = ref(false);
const items = ref([
  { label: "GPT", value: 1 },
  { label: "Stable Diffusion", value: 2 },
]);

const itemsSol = ref([
  { label: "512*512", value: "512*512" },
]);
const saveConfigImage = async ()=>{
    loading.value = true
    try {
        const res = request.post(`api/admin/index.php?key=${apiKey.value}&action=sd_edit`,{
            redirect: selectAI.value,
            image_size: Resolution.value
        },
        {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/x-www-form-urlencoded",
      })
      if(res.data.data===1){
        fetchConfig()
        loading.value = false
      }
      else{
        loading.value = false
      }
        

        
    } catch (error) {
        loading.value = false
    }
}
onMounted(() => {
  fetchConfig();
});
</script>

<template>
    <section v-if="role!=0">
    <a-result
      status="500"
      title="401"
      sub-title="Bạn không có quyền truy cập trang này!"
    >
      <template #extra> </template>
    </a-result>
  </section>

  <section>
    <VCol cols="12">
      <VCard title="Edit Config IMAGE">
        <VProgressLinear v-if="loading" indeterminate color="primary" />
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VSelect
                :items="items"
                label="Select AI"
                v-model="selectAI"
                item-title="label"
                chips
                item-value="value"
              >
                <template #chip="{ props, item }">
                  <VChip
                    v-bind="props"
                    :prepend-avatar="selectAI == 1 ? gpt : dfs"
                    :text="items.label"
                  />
                </template>
              </VSelect>
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VSelect
                :items="itemsSol"
                label="Select Độ Phân Giải"
                v-model="Resolution"
                item-title="label"
                chips
                item-value="value"
              >
              </VSelect>
            </VCol>
            <div class="btn">
              <VBtn @click="saveConfigImage" color="primary"> Save </VBtn>
            </div>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </section>
</template>

<style lang="scss" scoped>
.btn{
    width: 100%;
    display: flex;
    justify-content: flex-end;
}
</style>
