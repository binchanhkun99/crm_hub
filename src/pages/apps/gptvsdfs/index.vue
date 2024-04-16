<script setup>
import request from "@/utils/request";
import { onMounted } from "vue";

import gpt from "@images/logos/gpt.png";
import dfs from "@images/logos/Stable_Diffusion_logo_2b68efd6c7.png";

const selectAI = ref();
const Resolution = ref();

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
  { label: "3P", value: 2 },
]);

const notiSuccess = ref(false);
const notiError = ref(false);
const pushNotiSuccess = () => {
  notiSuccess.value = true;
  setTimeout(() => {
    notiSuccess.value = false;
  }, 2000);
};
const pushNotiError = () => {
  notiError.value = true;
  setTimeout(() => {
    notiError.value = false;
  }, 2000);
};
const itemsSol = ref([
  { label: "512*512", value: "512*512" },
]);
const saveConfigImage = async ()=>{
    loading.value = true
    try {
        const res = await request.post(`api/admin/index.php?key=${apiKey.value}&action=sd_edit`,{
            redirect: selectAI.value,
            image_size: Resolution.value
        },
        {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/x-www-form-urlencoded",
      })
      // console.log("gugu", res);
      if(res.data.data===1){
        fetchConfig()
        pushNotiSuccess()
        loading.value = false
      }
      else{
        loading.value = false
        pushNotiError()
      }
        

        
    } catch (error) {
        loading.value = false
        pushNotiError()
    }
}
const role = ref(0);
onMounted(() => {
  const dataRole = JSON.parse(localStorage.getItem("user")) || {};

role.value = dataRole.level;
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

  <section v-else>
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
            <!-- <VCol cols="12">
              <VSelect
                :items="itemsSol"
                label="Select Độ Phân Giải"
                v-model="Resolution"
                item-title="label"
                chips
                item-value="value"
              >
              </VSelect>
            </VCol> -->
            <div class="btn">
              <VBtn @click="saveConfigImage" color="primary"> Save </VBtn>
            </div>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
    
      <!-- Success-->
      <VDialog v-model="notiSuccess" width="300">
        <VCard color="primary" width="300">
          <VAlert type="success">
            <strong>Thành công</strong>
          </VAlert>
        </VCard>
      </VDialog>

      <!-- Error-->
      <VDialog v-model="notiError" width="300">
        <VCard color="primary" width="300">
          <VAlert type="error">
            <strong>Đã có lỗi xẩy ra vui lòng thử lại sau</strong>
          </VAlert>
        </VCard>
      </VDialog>
  </section>
</template>

<style lang="scss" scoped>
.btn{
    width: 100%;
    display: flex;
    justify-content: flex-end;
}
</style>
