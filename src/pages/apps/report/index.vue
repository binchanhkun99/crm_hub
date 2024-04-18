<script setup>
import ThongKe from "@/pages/components/thongke.vue";
import request from "@/utils/request";
import { requiredValidator } from "@validators";
import { onMounted, watch } from "vue";

const searchQuery = ref("");
const selectedRole = ref();
const selectedPlan = ref();
const selectedStatus = ref();
const rowPerPage = ref(10);
const currentPage = ref(1);
const totalPage = ref(10);
const totalUsers = ref(0);
const invoiceData = ref([]);
const loading = ref(false);
const apiKey = ref();
const page = ref(1);
const show1 = ref(false);

const isDialogVisible = ref(false);

const pageSize = ref(0);

page.value = currentPage.value;
// 👉 Fetching invoiceData
const fetchInvoice = async () => {
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  let offset = (page.value - 1);
  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&page=${offset}&action=list_bills&limit=${rowPerPage.value}`
    )
    .then((rss) => {
      if (rss.data.status) {
        invoiceData.value = rss.data.data.data;
        totalPage.value = rss.data.data.count;
        pageSize.value = Math.ceil(totalPage.value / rowPerPage.value) || 0;
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
// 👉 Fetching invoiceData
const fetchBannerPag = async (page) => {
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  let offset = (page - 1);
  apiKey.value = data.key;
  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&page=${offset}&limit=${rowPerPage.value}&search=${searchQuery.value}&action=banner_list`
    )
    .then((rss) => {
      if (rss.data.success) {
        invoiceData.value = rss.data.data;
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

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = invoiceData.value.length
    ? currentPage.value * rowPerPage.value
    : 0;
  const lastIndex =
    invoiceData.value.length + currentPage.value * rowPerPage.value;

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
      fetchInvoice();
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
  fetchInvoice();
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

const exportTable = ref();
const stDate = ref();
const endDate = ref();
const ExportExcel = async () => {
  if (!stDate.value || !endDate.value) {
    alert("Thời gian không được để trống!");
    return;
  }

  try {
    const res = await request.post(
      `https://api-test.aidu.com.vn/api/admin/index.php?key=${apiKey.value}&action=export_excel&day_start=${stDate.value}&day_end=${endDate.value}`
    );
 
    if (res.data.status === true) {
      const fileName = "Export_data_today";
      const data = res.data.data.data;

      // Thêm BOM vào đầu tệp CSV
      const bom = "\uFEFF";
      const csvContent = bom + convertDataToCSV(data);

      // Tạo và tải tệp CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${fileName}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.log(error);
  }
}

function convertDataToCSV(data) {
  if (!data || !data.length) {
    return '';
  }

  // Mapping giữa tên cột gốc và tên cột mới
  const columnMappings = {
    id_giaodich:'ID Giao Dịch',
    user: 'Người dùng',
    maGioiThieu: 'Mã giới thiệu',
    address: 'Địa chỉ',
    money: 'Số tiền',
    title_pack: 'Tên gói',
    count: 'Số lượng',
    createAt: 'Ngày tạo',
    discount_code: 'Mã giảm giá',
    // Các cột khác ở đây
  };

  const columns = Object.keys(data[0]);

  // Tạo dòng header CSV từ các khóa
  const header = columns.filter(column => !['id_pack', 'id', 'id_user', 'id_discount', 'status', 'level'].includes(column)).map(column => {
    return columnMappings[column] || column; // Sử dụng tên cột mới nếu có hoặc giữ nguyên tên cột gốc
  }).join(',') + '\n';

  // Tạo các dòng dữ liệu từ mỗi đối tượng trong mảng
  const rows = data.map((item) => {
    return columns.filter(column => !['id_pack', 'id', 'id_user', 'id_discount', 'status', 'level'].includes(column)).map(column => {
      let value = item[column];
      if (typeof value === 'string' && value.includes(',')) {
        value = `"${value}"`;
      }
      
      return value;
    }).join(',');
  }).join('\n');

  return header + rows;
}


// const ExportExcel = async () => {
//   if (!stDate.value || !endDate.value) {
//     alert("Thời gian không được để trống!");
//     return;
//   }

//   try {
//     const res = await request.post(
//       `https://api-test.aidu.com.vn/api/admin/index.php?key=${apiKey.value}&action=export_excel&day_start=${stDate.value}&day_end=${endDate.value}`
//     );
//     console.log("res.data:", res.data);
//     if (res.data.status === true) {
//       console.log("aaaa");

//       const fileName = "Export_data_today";
//       const data = invoiceData.value;
//       if (data) exportFromJSON({ data, fileName, exportType });

   
//     }
//   } catch (error) {
//     console.log(error);
//   }
//      // console.log("Vào đây chưa???");
//       // window.open(
//       //   "https://api-test.aidu.com.vn/api/admin/report_data.xlsx",
//       //   "_blank"
//       // );
//       // console.log("Vô r");




//   //   console.log("exportTable", exportTable.value);
//   //     const fileName = "np-data";
//   //   const data = invoiceData.value;
//   //   for (const item of data) {
//   //   if (item.des) {
//   //     item.des = unescape(item.des);
//   //   }
//   // }
//   // console.log(data);
//   //   const exportType = exportFromJSON.types.csv;
//   //   if (data) exportFromJSON({ data, fileName, exportType });
//   // const deleteUsr = await request.get(
//   //   `api/admin/index.php?key=${apiKey.value}&action=export_excel`
//   // );
// };
const role = ref(0);
// 👉 OnMounted
onMounted(() => {
  try {
    const dataRole = JSON.parse(localStorage.getItem("user")) || {};
    
    role.value = dataRole.level;
    fetchInvoice();
  } catch (error) {
    console.log(error);
  }
});
</script>

<template>
  <section>
    <div v-if="role != 0">
      <a-result
        status="500"
        title="401"
        sub-title="Bạn không có quyền truy cập trang này!"
      >
        <template #extra> </template>
      </a-result>
    </div>
    <div v-else>
      <!-- <table ref="exportTable">
      <tbody>
        <tr>
          <td>h1</td>
          <td>h2</td>
          <td>h3</td>
        </tr>
      </tbody>
    </table> -->
      <div>
        <a-modal v-model:open="open" title="Delete Banner" @ok="handleOk">
          <p>Bạn có chắc muốn xoá Banner này?</p>
        </a-modal>
      </div>
      <VRow>
        <ThongKe />

        <VCol cols="12">
          <VCard title="Quản lý Hoá đơn - Doanh Thu">
            <VDivider />
            <VRow>
              <VCol
                cols="4"
                style="margin-top: 8px; position: relative; left: 10px"
              >
                <AppDateTimePicker
                  v-model="stDate"
                  label="Thời gian bắt đầu"
                  :config="{ enableTime: false, dateFormat: 'Y-m-d' }"
              /></VCol>
              <VCol cols="4" style="margin-top: 8px">
                <AppDateTimePicker
                  v-model="endDate"
                  label="Thời gian kết thúc"
                  :config="{ enableTime: false, dateFormat: 'Y-m-d' }"
              /></VCol>
              <VCol cols="4">
                <VCardText class="d-flex flex-wrap gap-4">
                  <!-- 👉 Export button -->

                  <VSpacer />

                  <div class="d-flex align-center">
                    <!-- 👉 Export -->
                    <VBtn color="primary" @click="ExportExcel">
                      <VIcon start icon="bx-cloud-upload" />
                      Export
                    </VBtn>
                  </div>
                </VCardText>
              </VCol>
            </VRow>

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
                      invoiceData.length !== selectedRows.length &&
                      !!selectedRows.length
                    "
                    class="mx-1"
                    @click="selectUnselectAll"
                  />
                </th> -->
                  <th scope="col">STT</th>
                  <th scope="col">Người dùng</th>
                  <th scope="col">Email</th>
                  <th scope="col">Gói đã mua</th>
                  <th scope="col">Giá</th>
                  <th scope="col">Ngày mua</th>
                  <!-- <th scope="col">ACTIONS</th> -->
                </tr>
              </thead>

              <!-- 👉 table body -->
              <tbody>
                <tr v-for="(user, index) in invoiceData" :key="index">
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
                          {{ user.user }}
                          <!-- </RouterLink> -->
                        </h6>
                      </div>
                    </div>
                  </td>

                  <!-- 👉 URL banner -->
                  <td>
                    <span class="text-capitalize text-base">{{
                      user.mail
                    }}</span>
                  </td>

                  <!-- 👉 Description -->
                  <td>
                    <span class="text-base text-high-emphasis">{{
                      user.title_pack
                    }}</span>
                  </td>
                  <td>
                    <span class="text-base text-high-emphasis">{{
                      user.money
                    }}</span>
                  </td>
                  <td>
                    <span class="text-base text-high-emphasis">{{
                      user.createAt
                    }}</span>
                  </td>
                  <!-- 👉 Actions -->
                </tr>
              </tbody>

              <!-- 👉 table footer  -->
              <tfoot v-show="!invoiceData.length">
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
            <VBtn
              color="secondary"
              variant="tonal"
              @click="isDialogEdit = false"
            >
              Close
            </VBtn>
            <VBtn @click="SaveEdit"> Save </VBtn>
          </VCardText>
        </VCard>
      </VDialog>
    </div>
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
