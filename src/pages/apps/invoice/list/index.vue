<script setup>
import request from "@/utils/request";
import { requiredValidator } from "@validators";
import { onMounted, watch } from "vue";
const searchQuery = ref("");
const selectedRole = ref();
const selectedPlan = ref();
const selectedStatus = ref();
const rowPerPage = ref(10);
const currentPage = ref(0);
const totalPage = ref(10);
const totalUsers = ref(0);
const gptData = ref([]);
const loading = ref(false);
const apiKey = ref();
const page = ref();
const show1 = ref(false);

const isDialogVisible = ref(false);

const userListMeta = [
  {
    icon: "bx-user",
    color: "primary",
    title: "Session",
    stats: "21,459",
    percentage: +29,
    subtitle: "Total Users",
  },
  {
    icon: "bx-user-plus",
    color: "error",
    title: "Paid Users",
    stats: "4,567",
    percentage: +18,
    subtitle: "Last week analytics",
  },
  {
    icon: "bx-user-check",
    color: "success",
    title: "Active Users",
    stats: "19,860",
    percentage: -14,
    subtitle: "Last week analytics",
  },
  {
    icon: "bx-user-voice",
    color: "warning",
    title: "Pending Users",
    stats: "237",
    percentage: +42,
    subtitle: "Last week analytics",
  },
];
const pageSize = ref(0);

page.value = currentPage.value;
// 👉 Fetching gptData
const fetchGPT = async () => {
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&page=${page.value}&limit=${rowPerPage.value}&search=${searchQuery.value}&action=gpt_list`
    )
    .then((rss) => {
      if (rss.data.status) {
        gptData.value = rss.data.data;
        totalPage.value = rss.data.count;
        pageSize.value = Math.ceil(totalPage.value / rowPerPage.value);
        loading.value = false;
      }
      loading.value = false;
    })
    .catch((error) => {
      loading.value = false;
      // console.log(error);
    });
  selectedRole.value = "all";
  selectedPlan.value = "all";
};
// 👉 Fetching gptData
const fetchGPTPag = async (page) => {
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&page=${page}&limit=${rowPerPage.value}&search=${searchQuery.value}`
    )
    .then((rss) => {
      if (rss.data.success) {
        gptData.value = rss.data.data;

        totalPage.value = rss.data.count;
        pageSize.value = Math.ceil(totalPage.value / rowPerPage.value);
        loading.value = false;
      }
      loading.value = false;
    })
    .catch((error) => {
      loading.value = false;
      // console.log(error);
    });
  selectedRole.value = "all";
  selectedPlan.value = "all";
};

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});
watch(currentPage, (newVal, oldVal) => {
  fetchGPTPag(newVal);
});

const isAddNewUserDrawerVisible = ref(false);

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = gptData.value.length
    ? currentPage.value * rowPerPage.value
    : 0;
  const lastIndex = gptData.value.length + currentPage.value * rowPerPage.value;

  return `${firstIndex}-${lastIndex} of ${totalUsers.value}`;
});

// SECTION Checkbox toggle
const selectedRows = ref([]);
const selectAllUser = ref(false);

// 👉 watch if checkbox array is empty all select should be uncheck
watch(
  selectedRows,
  () => {
    if (!selectedRows.value.length) selectAllUser.value = false;
  },
  { deep: true }
);

// 👉 Delete GPT
const open = ref(false);
const idDelete = ref();
const showModal = (id) => {
  idDelete.value = id;
  open.value = true;
};

const handleOk = (e) => {
  deleteUser();
};
const deleteUser = async () => {
  try {
    const deleteUsr = await request.post(
      `api/admin/index.php?key=${apiKey.value}&action=gpt_delete`,
      {
        id: idDelete.value,
      }
    );

    if (deleteUsr.data.data == 1) {
      fetchGPT();
      open.value = false;
      pushNotiSuccess();
    } else {
      pushNotiError();
      open.value = false;
    }
  } catch (error) {
    open.value = false;
    pushNotiError();
    console.log(error);
  }
};

// 👉 Search User
const SearchUser = async () => {
  currentPage.value = 0;
  fetchGPT();
};

// 👉 Add GPT
const title = ref();
const gptKey = ref();
const loadingAddUser = ref(false);
const addUser = async () => {
  try {
    loadingAddUser.value = true;
    const response = await request.post(
      `api/admin/index.php?key=${apiKey.value}&action=gpt_create`,
      {
        title: title.value,
        apikey: gptKey.value,
      }
    );
    if (response.data.data === 1) {
      loadingAddUser.value = false;
      isDialogVisible.value = false;
      fetchGPT();
      pushNotiSuccess();
    } else {
      isDialogVisible.value = false;
      loadingAddUser.value = false;
      pushNotiError();
    }
  } catch (error) {
    pushNotiError();
    loadingAddUser.value = false;
    isDialogVisible.value = false;
    console.log(error);
  }
};

// 👉 Edit User
const loadingEdit = ref(false);
const isDialogEdit = ref(false);
const Edit = ref({
  title: "",
  gptKey: "",
});
function resetEditValues() {
  Edit.value.title = "";
  Edit.value.gptKey = "";
}
const idGptEdit = ref();
const showEdit = async (id) => {
  resetEditValues();
  idGptEdit.value = id;
  loadingEdit.value = true;
  try {
    const res = await request.get(
      `api/admin/index.php?key=${apiKey.value}&page=${page.value}&limit=${rowPerPage.value}&id=${idGptEdit.value}&action=gpt_list`
    );
    if (res.data.status) {
      const data = res.data.data[0];
      Edit.value.title = data.title;
      Edit.value.gptKey = data.apikey;
      loadingEdit.value = false;
      isDialogEdit.value = true;
    }
    loadingEdit.value = false;
  } catch (error) {
    console.log(error);
    loadingEdit.value = false;
  }
};

const items = ref([
  { label: "Admin", value: 0 },
  { label: "Nhân viên", value: 1 },
  { label: "Đại lý", value: 2 },
  { label: "Cộng tác viên", value: 3 },
  { label: "Người dùng", value: 4 },
]);
// watch(selectedItem, (newVal, oldVal)=>{
//   console.log(newVal);
// })
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
const SaveEdit = async () => {
  try {
    loadingAddUser.value = true;
    const res = await request.post(
      `api/admin/index.php?key=${apiKey.value}&action=user_edit`,
      {
        id: idGptEdit.value,
        title: Edit.value.title,
        apikey: Edit.value.gptKey,
        // user: Edit.value.ngayHetHan1,
        // user: Edit.value.ngayDangKy1,
      },
      {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/x-www-form-urlencoded",
      }
    );
    if (res.data.data == 1) {
      loadingAddUser.value = false;
      pushNotiSuccess();
      fetchGPT();
    } else {
      loadingAddUser.value = false;
      isDialogEdit.value = false;
      pushNotiError();
    }
  } catch (error) {
    pushNotiError();
    loadingAddUser.value = false;
    console.log(error);
    isDialogEdit.value = false;
  }
};
const role = ref(0);
// 👉 OnMounted
onMounted(() => {
  const dataRole = JSON.parse(localStorage.getItem("user")) || {};
  role.value = dataRole.level;
  console.log("role.value ", role.value );
  fetchGPT();
});
</script>

<template>
 
  <section v-if="role != 0">

    <a-result
      status="500"
      title="401"
      sub-title="Bạn không có quyền truy cập trang này!"
    >
      <template #extra> </template>
    </a-result>
  </section>
  <section v-else>
    <div>
      <a-modal v-model:open="open" title="Delete Key GPT" @ok="handleOk">
        <p>Bạn có chắc muốn xoá Key này?</p>
      </a-modal>
    </div>
    <VRow>

      <VCol cols="12">
        <VCard title="Quản lý GPT">
          <VCardText> </VCardText>

          <VDivider />

          <VCardText class="d-flex flex-wrap gap-4">
            <!-- 👉 Export button -->

            <VSpacer />

            <div class="d-flex align-center">
              <!-- 👉 Add user button -->
              <VBtn @click="isDialogVisible = !isDialogVisible"> Add GPT </VBtn>
            </div>
          </VCardText>
          <VDivider />
          <VProgressLinear v-if="loading" indeterminate color="primary" />
          <VTable class="text-no-wrap">
            <!-- 👉 table head -->
            <thead>
              <tr>
                <!-- <th scope="col" style="width: 48px">
                  <VCheckbox
                    :model-value="selectAllUser"
                    :indeterminate="
                      gptData.length !== selectedRows.length &&
                      !!selectedRows.length
                    "
                    class="mx-1"
                    @click="selectUnselectAll"
                  />
                </th> -->
                <th scope="col">STT</th>
                <th scope="col">Title</th>
                <th scope="col">API Key</th>
                <th scope="col">Count</th>
                <th scope="col">Status</th>
                <th scope="col">Ngày tạo</th>
                <th scope="col">ACTIONS</th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr v-for="(user, index) in gptData" :key="index">
                <!-- 👉 Checkbox -->
                <!-- <td>
                  <VCheckbox
                    :id="`check${user.id}`"
                    :model-value="selectedRows.includes(`check${user.id}`)"
                    class="mx-1"
                    @click="addRemoveIndividualCheckbox(`check${user.id}`)"
                  />
                </td> -->

                <!-- 👉 User -->
                <td>
                  <div class="d-flex align-center">
                    {{ index + 1 }}
                  </div>
                </td>
                <td>
                  <div class="d-flex align-center">
                    <!-- <VAvatar
                      variant="tonal"
                      :color="resolveUserRoleVariant(user.role).color"
                      class="me-3"
                      size="34"
                    >
                      <VImg v-if="user.avatar" :src="user.avatar" />
                      <span v-else class="text-sm">{{
                        avatarText(user.user)
                      }}</span>
                    </VAvatar> -->

                    <div class="d-flex flex-column">
                      <h6 class="text-sm">
                        <!-- <RouterLink
                          :to="{
                            name: 'apps-user-view-id',
                            params: { id: user.id },
                          }"
                          class="font-weight-medium user-list-name"
                        > -->
                        {{ user.title }}
                        <!-- </RouterLink> -->
                      </h6>
                    </div>
                  </div>
                </td>

                <!-- 👉 Country -->
                <td>
                  <span class="text-capitalize text-base">{{
                    user.apikey
                  }}</span>
                </td>

                <!-- 👉 Ngày Đăng Ký -->
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.count
                  }}</span>
                </td>

                <!-- 👉 Ngày Hết Hạn -->
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.status
                  }}</span>
                </td>

                <!-- 👉 Gói Đăng Ký -->
                <td>
                  {{ user.createAt }}
                </td>

                <!-- 👉 Actions -->
                <td class="text-center" style="width: 80px">
                  <VBtn color="warning" style="margin-right: 8px">
                    <VIcon icon="bxs-edit" @click="showEdit(user.id)" />
                  </VBtn>
                  <VBtn color="error" @click="showModal(user.id)">
                    <VIcon icon="bx-trash" />
                  </VBtn>
                  <!-- <MoreBtn :menu-list="computedMoreList(user.id)" item-props /> -->
                </td>
              </tr>
            </tbody>

            <!-- 👉 table footer  -->
            <tfoot v-show="!gptData.length">
              <tr>
                <td colspan="7" class="text-center text-body-1">
                  No data available
                </td>
              </tr>
            </tfoot>
          </VTable>

          <VDivider />

          <!-- SECTION Pagination -->
          <VCardText class="d-flex flex-wrap justify-end gap-4 pa-2">
            <!-- 👉 Rows per page -->
            <div class="d-flex align-center" style="width: 171px">
              <span class="text-no-wrap text-sm me-3">Rows per page:</span>
              <VSelect
                v-model="rowPerPage"
                density="compact"
                class="per-page-select"
                variant="plain"
                :items="[10, 20, 30, 50]"
              />
            </div>

            <!-- 👉 Pagination and pagination meta -->
            <div class="d-flex align-center">
              <h6 class="text-sm font-weight-regular">
                {{ paginationData }}
              </h6>
            </div>
            <VPagination
              v-model="currentPage"
              size="small"
              :total-visible="7"
              :length="pageSize"
              @next="selectedRows = []"
              @prev="selectedRows = []"
            />
          </VCardText>
          <!-- !SECTION -->
        </VCard>
      </VCol>
    </VRow>

    <!-- 👉 Add New User -->
    <VDialog v-model="isDialogVisible" max-width="600">
      <!-- Dialog Content -->
      <VCard title="Add New GPT">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isDialogVisible = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="title"
                label="Title"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="gptKey"
                :rules="[requiredValidator]"
                label="API Key"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="d-flex justify-end gap-2">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isDialogVisible = false"
          >
            Close
          </VBtn>
          <VBtn @click="addUser"> Save </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Dialog loading -->
    <VDialog v-model="loadingAddUser" width="300">
      <VCard color="primary" width="300">
        <VCardText class="pt-3">
          Waiting for me.....
          <VProgressLinear indeterminate class="mb-0" />
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Dialog loading data edit-->
    <VDialog v-model="loadingEdit" width="300">
      <VCard color="primary" width="300">
        <VCardText class="pt-3">
          Waiting for loading data gpt.....

          <VProgressLinear indeterminate class="mb-0" />
        </VCardText>
      </VCard>
    </VDialog>

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

    <!-- 👉 Edit New User -->
    <VDialog persistent v-model="isDialogEdit" max-width="600">
      <!-- Edit Dialog -->
      <VCard title="Edit GPT Key">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isDialogEdit = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="Edit.title"
                :rules="[requiredValidator]"
                label="Title"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="Edit.gptKey"
                :rules="[requiredValidator]"
                label="Key"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="d-flex justify-end gap-2">
          <VBtn color="secondary" variant="tonal" @click="isDialogEdit = false">
            Close
          </VBtn>
          <VBtn @click="SaveEdit"> Save</VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>

<style lang="scss">
.app-user-search-filter {
  inline-size: 385px;
}

.text-capitalize {
  text-transform: capitalize;
}

.user-list-name:not(:hover) {
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
}
.css-dev-only-do-not-override-1hsjdkk .ant-btn .ant-btn-primary span {
  color: white !important;
}
.per-page-select {
  margin-block: auto;

  .v-field__input {
    align-items: center;
    padding: 2px;
    font-size: 14px;
  }

  .v-field__append-inner {
    align-items: center;
    padding: 0;
    margin-inline-start: -2.5rem;

    .v-icon {
      margin-inline-start: 0 !important;
    }
  }
}
</style>
