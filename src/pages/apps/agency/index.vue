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
const chuDeList = ref([]);
const loading = ref(false);
const apiKey = ref();
const page = ref();
const show1 = ref(false);

const isDialogVisible = ref(false);

const pageSize = ref(0);

const pageMgt = ref(0);
const rowPerPageMgt = ref(10);
const users = ref([]);
const totalPageMgt = ref(10);
const currentPageMgt = ref(0);
const mgtListVal = ref();
const pageSizeMgt = ref();

page.value = currentPage.value;
// 👉 Fetching chuDeList
// const reduce = ref()
const ListChuDe = ref([]);
const dataAgency = ref();
const fetchAgency = async () => {
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&action=list_all_agencies&page=${page.value}`
    )
    .then((rss) => {
      if (rss.data.status) {
        dataAgency.value = rss.data.data;
        totalPage.value = rss.data.count;
        pageSize.value = Math.ceil(totalPage.value / rowPerPage.value) || 0;
      }
      loading.value = false;
    })
    .catch((error) => {
      loading.value = false;
      console.log(error);
    });
  selectedRole.value = "all";
  selectedPlan.value = "all";
};

// 👉 Fetching chuDeList
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
        chuDeList.value = rss.data.data;

        totalPage.value = rss.data.count;
        pageSize.value = Math.ceil(totalPage.value / rowPerPage.value);
        loading.value = false;
      }
      loading.value = false;
    })
    .catch((error) => {
      loading.value = false;
      console.log(error);
    });
  selectedRole.value = "all";
  selectedPlan.value = "all";
};

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
  if (currentPageMgt.value > totalPageMgt.value)
    currentPageMgt.value = totalPageMgt.value;
});

watch(currentPage, (newVal, oldVal) => {
  fetchBannerPag(newVal);
});

// 👉 search filters
const fetchUserbyMgt = async (page) => {
  loadingAddUser.value = true;
  await request
    .get(
      `api/getAllUser.php?key=${apiKey.value}&page=${page}&limit=${rowPerPageMgt.value}&maGioiThieu=${mgtListVal.value}`
    )
    .then((rss) => {
      if (rss.data.success) {
        isListMagioiThieu.value = true;
        users.value = rss.data.data;

        totalPage.value = rss.data.count;
        pageSize.value = Math.ceil(totalPage.value / rowPerPage.value);
        loadingAddUser.value = false;
      }
      loadingAddUser.value = false;
    })
    .catch((error) => {
      loadingAddUser.value = false;
      console.log(error);
    });
};

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = chuDeList.value.length
    ? currentPage.value * rowPerPage.value
    : 0;
  const lastIndex =
    chuDeList.value.length + currentPage.value * rowPerPage.value;

  return `${firstIndex}-${lastIndex} of ${totalUsers.value}`;
});

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
      `api/admin/index.php?key=${apiKey.value}&action=delete_agency`,
      {
        id: idDelete.value,
      }
    );
    if (deleteUsr.data.status) {
      fetchAgency();
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
  fetchAgency();
};
const loadings = ref([]);

const load = (i) => {
  loadings.value[i] = true;
  setTimeout(() => {
    loadings.value[i] = false;
  }, 3000);
};

// 👉 Edit Agency
const loadingEdit = ref(false);
const isDialogEdit = ref(false);
const Edit = ref({
  id_user: "",
  maGioiThieu: "",
  role: "",
  reduce: "",
  note: "",
});
function resetEditValues() {
  Edit.value.id_user = "";
  Edit.value.maGioiThieu = "";
  Edit.value.role;
  Edit.value.reduce = "";
  Edit.value.note = "";
}
const idAgencyEdit = ref();
// const isIDUSER = ref()
const showEdit = async (id) => {
  resetEditValues();
  idAgencyEdit.value = id;
  loadingEdit.value = true;
  try {
    const res = await request.get(
      `api/admin/index.php?key=${apiKey.value}&id=${idAgencyEdit.value}&action=search_agency_by_id`
    );
    if (res.data.status) {
      const data = res.data.data;
      Edit.value.id_user = data.id_user;
      Edit.value.maGioiThieu = data.maGioiThieu;
      Edit.value.role = data.role;
      Edit.value.note = data.note;
      Edit.value.reduce = data.reduce;
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
  { label: "Quyền 1", value: 1 },
  { label: "Quyền 2", value: 2 },
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
const loadingAddUser = ref(false);
const SaveEdit = async () => {
  try {
    loadingAddUser.value = true;
    const res = await request.post(
      `api/admin/index.php?key=${apiKey.value}&action=update_agency`,
      {
        id: idAgencyEdit.value,
        id_user: Edit.value.id_user,
        maGioiThieu: Edit.value.maGioiThieu,
        role: Edit.value.role,
        reduce: Edit.value.reduce,
        note: Edit.value.note,
        // user: Edit.value.ngayHetHan1,
        // user: Edit.value.ngayDangKy1,
      },
      {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/x-www-form-urlencoded",
      }
    );
    if (res.data.status) {
      isDialogEdit.value = false;
      loadingAddUser.value = false;
      pushNotiSuccess();
      fetchAgency();
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

const isListMagioiThieu = ref(false);
// 👉 Computing pagination data
const paginationDataMgt = computed(() => {
  const firstIndex = users.value.length
    ? currentPageMgt.value * rowPerPageMgt.value
    : 0;
  const lastIndex =
    users.value.length + currentPageMgt.value * rowPerPageMgt.value;

  return `${firstIndex}-${lastIndex} of ${totalPageMgt.value}`;
});
// SECTION Checkbox toggle
const selectedRows = ref([]);
const selectAllUser = ref(false);

const showListMgt = async (mgt) => {
  mgtListVal.value = mgt;
  loadingAddUser.value = true;
  await request
    .get(
      `api/getAllUser.php?key=${apiKey.value}&page=${pageMgt.value}&limit=${rowPerPageMgt.value}&maGioiThieu=${mgt}`
    )
    .then((rss) => {
      if (rss.data.success) {
        isListMagioiThieu.value = true;
        users.value = rss.data.data;
        totalPageMgt.value = rss.data.count;
        pageSizeMgt.value = Math.ceil(totalPageMgt.value / rowPerPageMgt.value);
        loadingAddUser.value = false;
      }
      loadingAddUser.value = false;
    })
    .catch((error) => {
      loadingAddUser.value = false;
      console.log(error);
    });
};

// 👉 watch if checkbox array is empty all select should be uncheck
watch(
  selectedRows,
  () => {
    if (!selectedRows.value.length) selectAllUser.value = false;
  },
  { deep: true }
);

// SECTION Checkbox toggle
const selectedRowsMgt = ref([]);
const selectAllUserMgt = ref(false);

// 👉 watch if checkbox array is empty all select should be uncheck
watch(
  selectedRowsMgt,
  () => {
    if (!selectedRowsMgt.value.length) selectAllUserMgt.value = false;
  },
  { deep: true }
);

watch(currentPageMgt, (newVal, oldVal) => {
  fetchUserbyMgt(newVal);
});
const role = ref(0);
const dataRole = JSON.parse(localStorage.getItem("user")) || {};

role.value = dataRole.level;
// 👉 OnMounted
onMounted(() => {
  fetchAgency();
});
</script>

<template>
  <section>
    {{ chuDeList.value }}
    <div>
      <a-modal v-model:open="open" title="Delete Agency" @ok="handleOk">
        <p>Bạn có chắc muốn xoá Agency này?</p>
      </a-modal>
    </div>
    <VRow>
      <VCol cols="12">
        <VCard title="Quản lý Đại Lý">
          <VDivider />

          <VCardText class="d-flex flex-wrap gap-4">
            <!-- 👉 Export button -->

            <VSpacer />

            <div class="d-flex align-center">
              <!-- 👉 Add Agency button -->
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
                      chuDeList.length !== selectedRows.length &&
                      !!selectedRows.length
                    "
                    class="mx-1"
                    @click="selectUnselectAll"
                  />
                </th> -->
                <th scope="col">STT</th>
                <th scope="col">Đai lý</th>
                <th scope="col">Email</th>
                <th scope="col">Mã giới thiệu</th>
                <th scope="col">Giá</th>
                <th scope="col">Ghi chú</th>
                <th scope="col" v-if="role == 0 || role == 1">ACTIONS</th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr v-for="(user, index) in dataAgency" :key="index">
                <td>
                  <div class="d-flex align-center">
                    {{ index + 1 }}
                  </div>
                </td>
                <td>
                  <div class="d-flex align-center">
                    <div class="d-flex flex-column">
                      <h6 class="text-sm">
                        {{ user.user }}
                      </h6>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-center">
                    <div class="d-flex flex-column">
                      <h6 class="text-sm">
                        {{ user.mail }}
                      </h6>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-center">
                    <div class="d-flex flex-column">
                      <h6 class="text-sm" style="margin-bottom: 0px">
                        {{ user.maGioiThieu }}
                        <VBtn
                          style="height: 40px; width: 40px; margin-left: 4px"
                          color="warning"
                          icon="bx-cloud-upload"
                          @click="showListMgt(user.maGioiThieu)"
                        />
                      </h6>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-center">
                    <div class="d-flex flex-column">
                      <h6 class="text-sm">
                        {{ user.reduce }}
                      </h6>
                    </div>
                  </div>
                </td>
                <td>
                  <VTextarea v-if="user.note"
                    style="width: 180px"
                    v-model="user.note"
                    label=""
                  />
                  
                  <span v-else>Không có ghi chú</span>
                </td>
                <!-- 👉 Actions -->
                <td
                  class="text-center"
                  style="width: 80px"
                  v-if="role == 0 || role == 1"
                >
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
            <tfoot v-show="!ListChuDe.length">
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
          Waiting for loading data Agency.....
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
      <VCard title="Đại lý">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isDialogEdit = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VSelect
                :items="items"
                label="Chọn quyền"
                v-model="Edit.role"
                item-title="label"
                item-value="value"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="Edit.maGioiThieu"
                :rules="[requiredValidator]"
                label="Mã giới thiệu"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="Edit.reduce"
                :rules="[requiredValidator]"
                label="Giá"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="Edit.note"
                :rules="[requiredValidator]"
                label="Ghi chú"
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

    <!-- List Mã giới thiệu  -->
    <VDialog v-model="isListMagioiThieu" max-width="800">
      <VRow>
        <VCol cols="12">
          <VCard title="Danh sách User theo mã giới thiệu">
            <VDivider />

            <VCardText class="d-flex flex-wrap gap-4">
              <!-- 👉 Export button -->

              <VSpacer />

              <div class="d-flex align-center">
                <!-- 👉 Add Agency button -->
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
                      chuDeList.length !== selectedRows.length &&
                      !!selectedRows.length
                    "
                    class="mx-1"
                    @click="selectUnselectAll"
                  />
                </th> -->
                  <th scope="col">STT</th>
                  <th scope="col">User</th>
                  <th scope="col">Email</th>
                  <th scope="col">Mã giới thiệu</th>
                </tr>
              </thead>

              <!-- 👉 table body -->
              <tbody>
                <tr v-for="(user, index) in users" :key="index">
                  <td>
                    <div class="d-flex align-center">
                      {{ index + 1 }}
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-center">
                      <div class="d-flex flex-column">
                        <h6 class="text-sm">
                          {{ user.user }}
                        </h6>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-center">
                      <div class="d-flex flex-column">
                        <h6 class="text-sm">
                          {{ user.mail }}
                        </h6>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-center">
                      <div class="d-flex flex-column">
                        <h6 class="text-sm" style="margin-bottom: 0px">
                          {{ user.maGioiThieu }}
                        </h6>
                      </div>
                    </div>
                  </td>
                  <!-- 👉 Actions -->
                </tr>
              </tbody>

              <!-- 👉 table footer  -->
              <tfoot v-show="!users.length">
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
                  v-model="rowPerPageMgt"
                  density="compact"
                  class="per-page-select"
                  variant="plain"
                  :items="[10, 20, 30, 50]"
                />
              </div>

              <!-- 👉 Pagination and pagination meta -->
              <div class="d-flex align-center">
                <h6 class="text-sm font-weight-regular">
                  {{ paginationDataMgt }}
                </h6>
              </div>
              <VPagination
                v-model="currentPageMgt"
                size="small"
                :total-visible="7"
                :length="pageSizeMgt"
                @next="selectedRowsMgt = []"
                @prev="selectedRowsMgt = []"
              />
            </VCardText>
            <!-- !SECTION -->
          </VCard>
        </VCol>
      </VRow>
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
