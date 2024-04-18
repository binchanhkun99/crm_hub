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
const bannerData = ref([]);
const loading = ref(false);
const apiKey = ref();
const page = ref();
const show1 = ref(false);

const isDialogVisible = ref(false);

const pageSize = ref(0);

page.value = currentPage.value;
// 👉 Fetching bannerData
const fetchBanner = async () => {
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&page=${page.value}&limit=${rowPerPage.value}&search=${searchQuery.value}&action=banner_list`
    )
    .then((rss) => {
      if (rss.data.status) {
        bannerData.value = rss.data.data;
        totalPage.value = rss.data.count;
        pageSize.value = Math.ceil(totalPage.value / rowPerPage.value) || 0;
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
// 👉 Fetching bannerData
const fetchBannerPag = async (page) => {
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&page=${page}&limit=${rowPerPage.value}&search=${searchQuery.value}&action=banner_list`
    )
    .then((rss) => {
      if (rss.data.success) {
        bannerData.value = rss.data.data;

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
  fetchBannerPag(newVal);
});

// 👉 search filters
const roles = ref([
  {
    title: "Tất cả",
    value: "all",
  },
  {
    title: "Quản trị viên",
    value: "admin",
  },
  {
    title: "Kiểm duyệt viên",
    value: "author",
  },
  {
    title: "Cộng tác viên",
    value: "editor",
  },
  {
    title: "Đại lý",
    value: "maintainer",
  },
  {
    title: "Subscriber",
    value: "subscriber",
  },
]);

const plans = ref([
  {
    title: "Tất cả",
    value: "all",
  },
  {
    title: "Basic",
    value: "basic",
  },
  {
    title: "Company",
    value: "company",
  },
  {
    title: "Enterprise",
    value: "enterprise",
  },
  {
    title: "Team",
    value: "team",
  },
]);

const status = ref([
  {
    title: "Tất cả",
    value: "all",
  },
  {
    title: "Pending",
    value: "pending",
  },
  {
    title: "Active",
    value: "active",
  },
  {
    title: "Inactive",
    value: "inactive",
  },
]);

const isAddNewUserDrawerVisible = ref(false);

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = bannerData.value.length
    ? currentPage.value * rowPerPage.value
    : 0;
  const lastIndex =
    bannerData.value.length + currentPage.value * rowPerPage.value;

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
      `api/admin/index.php?key=${apiKey.value}&action=banner_delete`,
      {
        id: idDelete.value,
      }
    );
    if (deleteUsr.data.data == 1) {
      fetchBanner();
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
  fetchBanner();
};

// 👉 Add GPT
const title = ref();
const Url = ref();
const Des = ref();
const loadingAddUser = ref(false);
const addUser = async () => {
  try {
    loadingAddUser.value = true;
    const response = await request.post(
      `api/admin/index.php?key=${apiKey.value}&action=banner_create`,
      {
        title: title.value,
        url: Url.value,
        des: Des.value,
      }
    );
    if (response.data.data === 1) {
      loadingAddUser.value = false;
      isDialogVisible.value = false;
      fetchBanner();
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

// 👉 Edit Banner
const loadingEdit = ref(false);
const isDialogEdit = ref(false);
const Edit = ref({
  title: "",
  Url: "",
  Des: "",
});
function resetEditValues() {
  Edit.value.title = "";
  Edit.value.Url = "";
  Edit.value.Des;
}
const idBannerEdit = ref();
const showEdit = async (id) => {
  resetEditValues();
  idBannerEdit.value = id;
  loadingEdit.value = true;
  try {
    const res = await request.get(
      `api/admin/index.php?key=${apiKey.value}&page=${page.value}&limit=${rowPerPage.value}&id=${idBannerEdit.value}&action=banner_list`
    );
    if (res.data.status) {
      const data = res.data.data[0];
      Edit.value.title = data.title;
      Edit.value.Url = data.url;
      Edit.value.Des = data.des;
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
      `api/admin/index.php?key=${apiKey.value}&action=banner_edit`,
      {
        id: idBannerEdit.value,
        url: Edit.value.Url,
        des: Edit.value.Des,
        // user: Edit.value.ngayHetHan1,
        // user: Edit.value.ngayDangKy1,
      },
      {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/x-www-form-urlencoded",
      }
    );
    if (res.data.data == 1) {
      isDialogEdit.value = false;
      loadingAddUser.value = false;
      pushNotiSuccess();
      fetchBanner();
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
// 👉 OnMounted
const role = ref(0);
onMounted(() => {
  const dataRole = JSON.parse(localStorage.getItem("user")) || {};
  role.value = dataRole.level;
  fetchBanner();
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
      <a-modal v-model:open="open" title="Delete Banner" @ok="handleOk">
        <p>Bạn có chắc muốn xoá Banner này?</p>
      </a-modal>
    </div>
    <VRow>
      <VCol cols="12">
        <VCard title="Quản lý Banner">
          <VDivider />

          <VCardText class="d-flex flex-wrap gap-4">
            <!-- 👉 Export button -->

            <VSpacer />

            <div class="d-flex align-center">
              <!-- 👉 Add Banner button -->
              <VBtn @click="isDialogVisible = !isDialogVisible">
                Add Banner
              </VBtn>
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
                      bannerData.length !== selectedRows.length &&
                      !!selectedRows.length
                    "
                    class="mx-1"
                    @click="selectUnselectAll"
                  />
                </th> -->
                <th scope="col">STT</th>
                <th scope="col">Title</th>
                <th scope="col">Url</th>
                <th scope="col">Description</th>
                <th scope="col">ACTIONS</th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr v-for="(user, index) in bannerData" :key="index">
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

                <!-- 👉 URL banner -->
                <td>
                  <span class="text-capitalize text-base">{{ user.url }}</span>
                </td>

                <!-- 👉 Description -->
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.des
                  }}</span>
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
            <tfoot v-show="!bannerData.length">
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
      <VCard title="Add New Banner">
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
                v-model="Url"
                :rules="[requiredValidator]"
                label="URL"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="Des"
                :rules="[requiredValidator]"
                label="Description"
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
          Waiting for loading data banner.....
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
      <VCard title="Edit Banner">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isDialogEdit = false"
        />

        <VCardText>
          <VRow>
            <!-- <VCol cols="12">
              <VTextField
                v-model="Edit.title"
                :rules="[requiredValidator]"
                label="Title"
              />
            </VCol> -->
            <VCol cols="12">
              <VTextField
                v-model="Edit.Url"
                :rules="[requiredValidator]"
                label="Url"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="Edit.Des"
                :rules="[requiredValidator]"
                label="Description"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="d-flex justify-end gap-2">
          <VBtn color="secondary" variant="tonal" @click="isDialogEdit = false">
            Close
          </VBtn>
          <VBtn @click="SaveEdit"> Save </VBtn>
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
