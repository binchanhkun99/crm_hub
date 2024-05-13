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
// 👉 Fetching chuDeList

const ListChuDe = ref([]);
const fetchBanner = async () => {
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;

  try {
    // Gọi cả hai API và chờ cả hai kết quả trả về
    const [res1, res2] = await Promise.all([
      request.get(`api/getType.php?type=ChuDe`),
      request.get(`dalle/getPromptType.php?type=chuDe`)
    ]);

    if (res1.data.status && res2.data.status) {
      // Lọc ra các phần tử có giá trị cho ChuDe từ cả hai API
      const chuDeList1 = res1.data.data.filter((item) => item.ChuDe !== "");
      const chuDeList2 = res2.data.data.filter((item) => item.chuDe !== "");

      // Ghép mảng từ cả hai API
      const mergedChuDeList = [...chuDeList1, ...chuDeList2];
     
      ListChuDe.value = mergedChuDeList; // Gán danh sách chủ đề cho ListChuDe
      console.log("ListChuDe.value+++++", ListChuDe.value);
      totalPage.value = res1.data.count; // Lấy tổng số trang từ res1
      pageSize.value = Math.ceil(totalPage.value / rowPerPage.value) || 0;
    }

    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.log(error);
  }

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

const isAddNewUserDrawerVisible = ref(false);

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = chuDeList.value.length
    ? currentPage.value * rowPerPage.value
    : 0;
  const lastIndex =
    chuDeList.value.length + currentPage.value * rowPerPage.value;

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
    const deleteUsr = await request.post(`api/deleteChuDe.php`, {
      id: idDelete.value,
    });
    if (deleteUsr.data.status) {
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
const ChuDe = ref();
const loadingAddUser = ref(false);
const addUser = async () => {
  try {
    loadingAddUser.value = true;
    const response = await request.post(`api/addChuDe.php`, {
      chuDe: ChuDe.value,
    });
    if (response.data.status) {
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

// 👉 Add Sub chủ đề
const isNewSub = ref(false);
const selectChuDe = ref();
const lsChuDe = ref([]);
const addSubChuDe = async () => {
  loadingEdit.value = true;
  //get chủ đề
  try {
    // Gọi cả hai API và chờ cả hai kết quả trả về
    const [res1, res2] = await Promise.all([
      request.get(`api/getType.php?type=ChuDe`),
      request.get(`dalle/getPromptType.php?type=chuDe`)
    ]);

    if (res1.data.status && res2.data.status) {
      // Lọc ra các phần tử có giá trị cho ChuDe từ API đầu tiên
      const chuDeList1 = res1.data.data.filter((item) => item.ChuDe !== "");

      // Lọc ra các phần tử có giá trị cho chuDe từ API thứ hai
      const chuDeList2 = res2.data.data.filter((item) => item.chuDe !== "");

      // Ghép mảng từ cả hai API
      const mergedChuDeList = [...chuDeList1, ...chuDeList2];

      chuDeList.value = mergedChuDeList; // Gán danh sách chủ đề cho chuDeList
      const addSubChuDe = async () => {
  loadingEdit.value = true;
  //get chủ đề
  try {
    // Gọi cả hai API và chờ cả hai kết quả trả về
    const [res1, res2] = await Promise.all([
      request.get(`api/getType.php?type=ChuDe`),
      request.get(`dalle/getPromptType.php?type=chuDe`)
    ]);

    if (res1.data.status && res2.data.status) {
      // Lọc ra các phần tử có giá trị cho ChuDe từ API đầu tiên
      const chuDeList1 = res1.data.data.filter((item) => item.ChuDe !== "");

      // Lọc ra các phần tử có giá trị cho chuDe từ API thứ hai
      const chuDeList2 = res2.data.data.filter((item) => item.chuDe !== "");

      // Ghép mảng từ cả hai API
      const mergedChuDeList = [...chuDeList1, ...chuDeList2];

      chuDeList.value = mergedChuDeList; // Gán danh sách chủ đề cho chuDeList

      // Sử dụng biểu thức điều kiện để chọn trường đúng trong hàm map
      lsChuDe.value = mergedChuDeList.map((item) => (item.ChuDe !== undefined ? item.ChuDe : item.chuDe));

      isNewSub.value = true;
    }

    loadingEdit.value = false;
  } catch (error) {
    console.log(error);
    loadingEdit.value = false;
  }
};

      isNewSub.value = true;
    }

    loadingEdit.value = false;
  } catch (error) {
    console.log(error);
    loadingEdit.value = false;
  }
};


const subChuDe = ref();
const listSubCD = ref([]);
watch(selectChuDe, async (newVal, oldVal) => {
  loadingEdit.value = true;
  try {
    await request
      .post("api/getSubChuDe.php", JSON.stringify({ chuDe: newVal }))
      .then((res) => {
        loadingEdit.value = false;
        listSubCD.value = res.data.data;
      });
  } catch (error) {
    loadingEdit.value = false;
  }
});

const addSubChuDeFinal = async () => {
  loadingAddUser.value = true;
  const response = await request.post(`api/addSubChuDe.php`, {
    chuDe: selectChuDe.value,
    subChuDe: subChuDe.value,
  });
  if (response.data.status) {
    loadingAddUser.value = false;
    isNewSub.value = false;
    fetchBanner();
    pushNotiSuccess();
  } else {
    isNewSub.value = false;
    loadingAddUser.value = false;
    pushNotiError();
  }
};
// 👉 Edit Chủ đề
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
    {{ chuDeList.value }}
    <div>
      <a-modal v-model:open="open" title="Delete Chủ đề" @ok="handleOk">
        <p>Bạn có chắc muốn xoá Chủ đề này?</p>
      </a-modal>
    </div>
    <VRow>
      <VCol cols="12">
        <VCard title="Quản lý Chủ đề">
          <VDivider />

          <VCardText class="d-flex flex-wrap gap-4">
            <!-- 👉 Export button -->

            <VSpacer />

            <div class="d-flex align-center">
              <!-- 👉 Add Chủ đề button -->
              <VBtn style="margin-right: 12px" @click="addSubChuDe">
                Add Sub Chủ đề
              </VBtn>
              <!-- 👉 Add Sub Chủ đề button -->
              <VBtn @click="isDialogVisible = !isDialogVisible">
                Add Chủ đề
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
                      chuDeList.length !== selectedRows.length &&
                      !!selectedRows.length
                    "
                    class="mx-1"
                    @click="selectUnselectAll"
                  />
                </th> -->
                <th scope="col">STT</th>
                <th scope="col">Chủ đề</th>

                <th scope="col">Hành động</th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr v-for="(user, index) in ListChuDe" :key="index">
                <td>
                  <div class="d-flex align-center">
                    {{ index + 1 }}
                  </div>
                </td>
                <td>
                  <div class="d-flex align-center">
                    <div class="d-flex flex-column">
                      <h6 class="text-sm">
                        {{ user.ChuDe || user.chuDe}}
                      </h6>
                    </div>
                  </div>
                </td>
                <!-- 👉 Actions -->
                <td class="text-center" style="width: 80px">
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
   
          <!-- !SECTION -->
        </VCard>
      </VCol>
    </VRow>

    <!-- 👉 Add New Chủ đề -->
    <VDialog v-model="isDialogVisible" max-width="600">
      <!-- Dialog Content -->
      <VCard title="Add Chủ Đề Mới">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isDialogVisible = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="ChuDe"
                label="Tên chủ Đề "
                :rules="[requiredValidator]"
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
    <!-- 👉 Add Sub Chủ đề -->
    <VDialog v-model="isNewSub" max-width="600">
      <!-- Dialog Content -->
      <VCard title="Add Sub Chủ Đề Mới">
        <DialogCloseBtn variant="text" size="small" @click="isNewSub = false" />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VSelect
                v-model="selectChuDe"
                :items="lsChuDe"
                label="Chủ đề"
                persistent-hint
                return-object
                single-line
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="subChuDe"
                label="SubChuDe"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              style="max-height: 350px; overflow: auto"
              v-if="selectChuDe"
            >
              <VTable class="text-no-wrap">
                <!-- 👉 table head -->
                <thead>
                  <tr>
                    <th scope="col">STT</th>
                    <th scope="col">Sub Chủ đề</th>

                    <!-- <th scope="col">ACTIONS</th> -->
                  </tr>
                </thead>

                <!-- 👉 table body -->
                <tbody>
                  <tr v-for="(user, index) in listSubCD" :key="index">
                    <td>
                      <div class="d-flex align-center">
                        {{ index + 1 }}
                      </div>
                    </td>
                    <td>
                      <div class="d-flex align-center">
                        <div class="d-flex flex-column">
                          <h6 class="text-sm">
                            {{ user }}
                          </h6>
                        </div>
                      </div>
                    </td>
                    <!-- 👉 Actions -->
                    <!-- <td class="text-center" style="width: 80px">
                      <VBtn color="error" @click="showModal(user.id)">
                        <VIcon icon="bx-trash" />
                      </VBtn>
                    
                    </td> -->
                  </tr>
                </tbody>
              </VTable>
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="d-flex justify-end gap-2">
          <VBtn color="secondary" variant="tonal" @click="isNewSub = false">
            Close
          </VBtn>
          <VBtn @click="addSubChuDeFinal"> Save </VBtn>
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
          Waiting for loading data Chủ đề.....
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
                label="Key"
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
