<script setup>
import request from "@/utils/request";
import { useUserListStore } from "@/views/apps/user/useUserListStore";
import { emailValidator, requiredValidator } from "@validators";
import { onMounted, watch } from "vue";
const userListStore = useUserListStore();
const searchQuery = ref("");
const selectedRole = ref();
const selectedPlan = ref();
const selectedStatus = ref();
const rowPerPage = ref(10);
const currentPage = ref(0);
const totalPage = ref(10);
const totalUsers = ref(0);
const users = ref([]);
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
// 👉 Fetching users
const fetchUsers = async () => {
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/getAllUser.php?key=${apiKey.value}&page=${page.value}&limit=${rowPerPage.value}&search=${searchQuery.value}`
    )
    .then((rss) => {
      if (rss.data.success) {
        users.value = rss.data.data;

        totalPage.value = rss.data.count;
        console.log(" totalPage.value", totalPage.value);
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
// 👉 Fetching users
const fetchUsersPag = async (page) => {
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/getAllUser.php?key=${apiKey.value}&page=${page}&limit=${rowPerPage.value}&search=${searchQuery.value}`
    )
    .then((rss) => {
      if (rss.data.success) {
        users.value = rss.data.data;

        totalPage.value = rss.data.count;
        console.log(" totalPage.value", totalPage.value);
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
  fetchUsersPag(newVal);
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
  const firstIndex = users.value.length
    ? currentPage.value * rowPerPage.value
    : 0;
  const lastIndex = users.value.length + currentPage.value * rowPerPage.value;

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

// 👉 Delete User
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
    const deleteUsr = await request.get(
      `api/admin/index.php?key=${apiKey.value}&action=user_delete&id=${idDelete.value}`
    );
    fetchUsers();
    open.value = false;
  } catch (error) {
    console.log(error);
  }
};

// 👉 Search User
const SearchUser = async () => {
  currentPage.value = 0;
  fetchUsers();
};

// 👉 Add User
const maGioiThieuAdd = ref();
const loadingAddUser = ref(false);
const userName = ref()
const password = ref("");
const email = ref("");
const addUser = async () => {
  let dataForm = new FormData();
  dataForm.append("user", userName.value);
  dataForm.append("pass", password.value);
  dataForm.append("mail", email.value);
  dataForm.append("maGioiThieu", maGioiThieuAdd.value);
  try {
    loadingAddUser.value = true;
    const response = await request.post("api/reg_acc.php", dataForm);
    if (response.data.status === "success") {
      loadingAddUser.value = false;
      isDialogVisible.value = false;
      fetchUsers();
    pushNotiSuccess()
    }
    else{
      pushNotiError()
    }
    isDialogVisible.value = false;
    loadingAddUser.value = false;
  } catch (error) {
    pushNotiError()
    loadingAddUser.value = false;
    isDialogVisible.value = false;
    console.log(error);
  }
};

// 👉 Edit User
const loadingEdit = ref(false);
const isDialogEdit = ref(false);
const Edit = ref({
  email1: "",
  userName1: "",
  password1: "",
  maGioiThieuAdd1: "",
  ngayDangKy1: "",
  ngayHetHan1: "",
  goiDangKy1: "",
});
function resetEditValues() {
  Edit.value.email1 = "";
  Edit.value.userName1 = "";
  Edit.value.password1 = "";
  Edit.value.maGioiThieuAdd1 = "";
  Edit.value.ngayDangKy1 = "";
  Edit.value.ngayHetHan1 = "";
  Edit.value.goiDangKy1 = "";
  selectedQuyen.value = "";
}
const idUserEdit = ref();
const selectedQuyen = ref();
const showEdit = async (id) => {
  resetEditValues();
  idUserEdit.value = id;
  loadingEdit.value = true;
  try {
    const res = await request.get(
      `api/admin/index.php?key=${apiKey.value}&action=user_find_info&id_user=${id}`
    );
    if (res.data.status) {
      const data = res.data.data;
      Edit.value.email1 = data.user.mail;
      Edit.value.userName1 = data.user.user;
      Edit.value.password1 = "";
      Edit.value.maGioiThieuAdd1 = data.user.maGioiThieu;
      Edit.value.ngayDangKy1 = data.user.thoiGianDangKy;
      Edit.value.ngayHetHan1 = data.user.thoiGianHetHan;
      selectedQuyen.value = data.user.level;
      Edit.value.goiDangKy1 = data.service || "Chưa đăng ký dịch vụ nào";
      loadingEdit.value = false;
      isDialogEdit.value = true;
    }
    loadingEdit.value = false;
  } catch (error) {
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
        id: idUserEdit.value,
        user: Edit.value.userName1,
        mail: Edit.value.email1,
        level: selectedQuyen.value,
        pass: Edit.value.password1,
        maGioiThieu: Edit.value.maGioiThieuAdd1,
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
      await request
        .get(
          `api/getAllUser.php?key=${apiKey.value}&page=${page.value}&limit=${rowPerPage.value}&id_user=${idUserEdit.value}`
        )
        .then((rss) => {
          if (rss.data.success) {
            users.value = rss.data.data;
            isDialogEdit.value = false;
            totalPage.value = rss.data.count;
            loading.value = false;
          }
          loading.value = false;
        })
        .catch((error) => {
          loading.value = false;
          console.log(error);
        });
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
onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <section>
    <div>
      <a-modal v-model:open="open" title="Delete User" @ok="handleOk">
        <p>Bạn có chắc muốn xoá User này?</p>
      </a-modal>
    </div>
    <VRow>
      <VCol
        v-for="meta in userListMeta"
        :key="meta.title"
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex justify-space-between">
            <div>
              <span>{{ meta.title }}</span>
              <div class="d-flex align-center gap-2">
                <h6 class="text-h6">
                  {{ meta.stats }}
                </h6>
                <span
                  :class="meta.percentage > 0 ? 'text-success' : 'text-error'"
                  class="text-sm"
                  >({{
                    meta.percentage > 0
                      ? `+${meta.percentage}`
                      : meta.percentage
                  }}%)</span
                >
              </div>
              <span class="text-sm">{{ meta.subtitle }}</span>
            </div>

            <VAvatar
              rounded
              variant="tonal"
              :color="meta.color"
              :icon="meta.icon"
            />
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12">
        <VCard title="Lọc người dùng">
          <VCardText>
            <VRow>
              <!-- 👉 Select Role -->

              <VCol cols="12" sm="3">
                <VSelect
                  v-model="selectedRole"
                  label="Quyền"
                  :items="roles"
                  clearable
                  clear-icon="bx-x"
                />
              </VCol>
              <!-- 👉 Select Plan -->
              <VCol cols="12" sm="3">
                <VSelect
                  v-model="selectedPlan"
                  label="Gói cước"
                  :items="plans"
                  clearable
                  clear-icon="bx-x"
                />
              </VCol>

              <!-- 👉 Select Status -->
              <VCol cols="12" sm="3">
                <VSelect
                  v-model="selectedStatus"
                  label="Select Status"
                  :items="status"
                  clearable
                  clear-icon="bx-x"
                />
              </VCol>
              <!-- 👉 Search  -->
              <VCol cols="12" sm="2">
                <VTextField
                  v-model="searchQuery"
                  placeholder="Email or Username"
                  density="compact"
                  class="me-3"
                />
              </VCol>

              <VCol cols="12" sm="1">
                <!-- 👉 Add user button -->

                <VBtn @click="SearchUser" color="primary">
                  <VIcon icon="bx-search" />
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>

          <VDivider />

          <VCardText class="d-flex flex-wrap gap-4">
            <!-- 👉 Export button -->

            <VSpacer />

            <div class="d-flex align-center">
              <!-- 👉 Add user button -->
              <VBtn @click="isDialogVisible = !isDialogVisible">
                Add User
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
                      users.length !== selectedRows.length &&
                      !!selectedRows.length
                    "
                    class="mx-1"
                    @click="selectUnselectAll"
                  />
                </th> -->
                <th scope="col">STT</th>
                <th scope="col">User Name/Email</th>
                <th scope="col">Quốc Gia</th>
                <th scope="col">Ngày Đăng Ký</th>
                <th scope="col">Ngày Hết Hạn</th>
                <th scope="col">Gói Đăng Ký</th>
                <th scope="col">Mã Giới Thiệu</th>
                <th scope="col">ACTIONS</th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr v-for="(user, index) in users" :key="index">
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
                    {{ index+1 }}
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
                      <span class="text-xs text-medium-emphasis">{{
                        user.mail
                      }}</span>
                    </div>
                  </div>
                </td>

                <!-- 👉 Country -->
                <td>
                  <span class="text-capitalize text-base">{{
                    user.country
                  }}</span>
                </td>

                <!-- 👉 Ngày Đăng Ký -->
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.thoiGianDangKy
                  }}</span>
                </td>

                <!-- 👉 Ngày Hết Hạn -->
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.thoiGianHetHan
                  }}</span>
                </td>

                <!-- 👉 Gói Đăng Ký -->
                <td>
                  {{ user.status }}
                </td>
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.maGioiThieu
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
              :total-visible="1"
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
      <VCard title="Add User">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isDialogVisible = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField v-model="userName" label="Username"  :rules="[requiredValidator]"/>
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="email"
                :rules="[emailValidator, requiredValidator]"
                label="Email"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="password"
                :append-inner-icon="show1 ? 'bx-hide' : 'bx-show'"
                :rules="[requiredValidator]"
                :type="show1 ? 'text' : 'password'"
                name="input-10-1"
                label="Password"
                hint="At least 8 characters"
                counter
                @click:append-inner="show1 = !show1"
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="maGioiThieuAdd"
                label="Mã giới thiệu"
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
          Waiting for loading data user.....

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
      <VCard title="Edit User">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isDialogEdit = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="Edit.userName1"
                :rules="[requiredValidator]"
                label="Username"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="Edit.email1"
                :rules="[emailValidator, requiredValidator]"
                label="Email"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="Edit.password1"
                :append-inner-icon="show1 ? 'bx-hide' : 'bx-show'"
                :rules="[requiredValidator]"
                :type="show1 ? 'text' : 'password'"
                name="input-10-1"
                label="Password"
                hint="At least 8 characters"
                counter
                filled
                @click:append-inner="show1 = !show1"
              />
            </VCol>
            <VCol cols="12">
              <!-- <VTextField v-model="Edit.ngayDangKy1" label="Ngày Đăng ký" 
        :rules="[requiredValidator]"/> -->
              <AppDateTimePicker
                v-model="Edit.ngayDangKy1"
                label="Ngày Đăng ký"
                :config="{ enableTime: true, dateFormat: 'Y-m-d H:i' }"
              />
            </VCol>
            <VCol cols="12">
              <AppDateTimePicker
                v-model="Edit.ngayHetHan1"
                label="Ngày Hết hạn"
                :config="{ enableTime: true, dateFormat: 'Y-m-d H:i' }"
              />
            </VCol>
            <VCol cols="12">
              <VSelect
                :items="items"
                label="Quyền"
                v-model="selectedQuyen"
                item-title="label"
                item-value="value"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="Edit.maGioiThieuAdd1"
                label="Mã giới thiệu"
                :rules="[requiredValidator]"
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
