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
const dataPack = ref([]);
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
// 👉 Fetching dataPack
const fetchPackage = async () => {
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&page=${page.value}&limit=${rowPerPage.value}&search=${searchQuery.value}&action=pack_list`
    )
    .then((rss) => {
      if (rss.data.status) {
        dataPack.value = rss.data.data;
        totalPage.value = rss.data.count;
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
// 👉 Fetching dataPack
const fetchPackagePag = async (page) => {
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&page=${page}&limit=${rowPerPage.value}&search=${searchQuery.value}&action=banner_list`
    )
    .then((rss) => {
      if (rss.data.success) {
        dataPack.value = rss.data.data;

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
  fetchPackagePag(newVal);
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
  const firstIndex = dataPack.value.length
    ? currentPage.value * rowPerPage.value
    : 0;
  const lastIndex =
    dataPack.value.length + currentPage.value * rowPerPage.value;

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

// 👉 Delete Package
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
      `api/admin/index.php?key=${apiKey.value}&action=pack_delete`,
      {
        id: idDelete.value,
      }
    );
    if (deleteUsr.data.data == 1) {
      fetchPackage();
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
  fetchPackage();
};

// 👉 Add package
const title = ref();
const Description = ref();
const TimeDate = ref();
const Expiry_date = ref();
const Price = ref();
const Platform = ref();
const Support_ids = ref();
const loadingAddUser = ref(false);
const supportList = ref();

const selectItemData = ref([]);
const beforAdd = async () => {
  loadingEdit.value = true;
  try {
    const res = await request.get(
      `api/admin/index.php?key=${apiKey.value}&action=select_promt`
    );
    if (res.data.status) {
      supportList.value = res.data.data;
      isDialogVisible.value = true;
      loadingEdit.value = false;
    } else {
      loadingEdit.value = false;
    }
  } catch (error) {
    console.log(error);
    loadingEdit.value = false;
  }
};
const beforEdit = async () => {
  loadingEdit.value = true;
  try {
    const res = await request.get(
      `api/admin/index.php?key=${apiKey.value}&action=select_promt`
    );
    if (res.data.status) {
      supportList.value = res.data.data;
      loadingEdit.value = false;
    } else {
      loadingEdit.value = false;
    }
  } catch (error) {
    console.log(error);
    loadingEdit.value = false;
  }
};
const platformLists = ["web", "extension", "window", "android", "iphone"];
const clearFields = () => {
  title.value = ""; // Clear title field
  Description.value = ""; // Clear Description field
  TimeDate.value = ""; // Clear TimeDate field
  Expiry_date.value = ""; // Clear Expiry_date field
  Price.value = ""; // Clear Price field
  Support_ids.value = []; // Clear Support_ids field
  Platform.value = []; // Clear Platform field
};
const addUser = async () => {
  try {
    // Check if required fields are not empty
    if (
      !title.value ||
      !Description.value ||
      !TimeDate.value ||
      !Expiry_date.value ||
      !Price.value ||
      !Support_ids.value ||
      !Platform.value
    ) {
      alert("Please fill in all fields");
      return;
    }

    const supportIdsString = Support_ids.value.join(",");
    const platformString = Platform.value.join(",");

    loadingAddUser.value = true;
    const response = await request.post(
      `api/admin/index.php?key=${apiKey.value}&action=pack_create`,
      {
        title: title.value,
        description: Description.value,
        date: TimeDate.value,
        expiry_date: Expiry_date.value,
        price: Price.value,
        support_ids: supportIdsString,
        platform: platformString,
      }
    );
    if (response.data.data === 1) {
      loadingAddUser.value = false;
      isDialogVisible.value = false;
      fetchPackage();
      pushNotiSuccess();
      clearFields();
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

// 👉 Edit Package
const loadingEdit = ref(false);
const isDialogEdit = ref(false);
const Edit = ref({
  title: "",
  Description: "",
  TimeDate: "",
  Expiry_date: "",
  Price: "",
  Support_ids: "",
  Platform: "",
});
function resetEditValues() {
  Edit.value.title = "";
  Edit.value.Description = "";
  Edit.value.TimeDate;
  Edit.value.Expiry_date = "";
  Edit.value.Price = "";
  Edit.value.Support_ids = "";
  Edit.value.Platform = "";
}
const idPackEdit = ref();
const prListEditVal = ref();
const showEdit = async (id) => {
  resetEditValues();
  const prListEdit = await beforEdit();
  idPackEdit.value = id;
  loadingEdit.value = true;
  try {
    const res = await request.post(
      `api/admin/index.php?key=${apiKey.value}&action=pack_find`,
      {
        id: idPackEdit.value,
      }
    );
    if (res.data.status) {
      const data = res.data.data[0];
      const dl = data.platform.split(",");

      let sp;
      sp = [];
      if (typeof data.support_ids === "string") {
        sp = data.support_ids.split(",");
      } else {
        sp = [data.support_ids];
      }
      selectItemData.value = [];
      for (const temp of sp) {
        selectItemData.value.push(parseInt(temp));
      }
      prListEditVal.value = sp;

      Edit.value.title = data.title;
      Edit.value.Description = data.description;
      Edit.value.TimeDate = data.date;
      Edit.value.Expiry_date = data.expiry_date;
      Edit.value.Price = data.price;
      Edit.value.Support_ids = selectItemData.value;
      Edit.value.Platform = dl;
      loadingEdit.value = false;
      isDialogEdit.value = true;
    }
    loadingEdit.value = false;
  } catch (error) {
    console.log(error);
    loadingEdit.value = false;
  }
};

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
    const plfStringEdit = Edit.value.Platform.join(",");
    const spidsStringEdit = Edit.value.Support_ids.join(",");
    if (
      !Edit.value.title ||
      !Edit.value.Description ||
      !Edit.value.TimeDate ||
      !Edit.value.Expiry_date ||
      !Edit.value.Price ||
      !spidsStringEdit ||
      !plfStringEdit
    ) {
      alert("Please fill in all fields");
      return;
    }
    loadingAddUser.value = true;
    const res = await request.post(
      `api/admin/index.php?key=${apiKey.value}&action=pack_edit`,
      {
        id: idPackEdit.value,
        title: Edit.value.title,
        description: Edit.value.Description,
        date: Edit.value.TimeDate,
        expiry_date: Edit.value.Expiry_date,
        price: Edit.value.Price,
        platform: plfStringEdit,
        support_ids: spidsStringEdit,
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
      fetchPackage();
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
onMounted(async () => {
  // await beforEdit();
  const dataRole = JSON.parse(localStorage.getItem("user")) || {};


  role.value = dataRole.level;
  // await beforEdit();
  fetchPackage();
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
      <a-modal v-model:open="open" title="Delete Package" @ok="handleOk">
        <p>Bạn có chắc muốn xoá Package này?</p>
      </a-modal>
    </div>
    <VRow>
  
      <VCol cols="12"> 
        <VCard title="Quản lý Pack">
          <VDivider />

          <VCardText class="d-flex flex-wrap gap-4">
            <!-- 👉 Export button -->

            <VSpacer />

            <div class="d-flex align-center">
              <!-- 👉 Add Pack button -->
              <VBtn @click="beforAdd"> Add Pack </VBtn>
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
                      dataPack.length !== selectedRows.length &&
                      !!selectedRows.length
                    "
                    class="mx-1"
                    @click="selectUnselectAll"
                  />
                </th> -->
                <th scope="col">STT</th>
                <th scope="col">Title</th>
                <th scope="col">Time of Pack</th>
                <th scope="col">Time hiệu lực</th>
                <th scope="col">Chi tiết</th>
                <th scope="col">Giá gói</th>

                <th scope="col">Platform</th>
                <th scope="col">ACTIONS</th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr v-for="(user, index) in dataPack" :key="index">
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
                  <span class="text-capitalize text-base">{{ user.date }}</span>
                </td>
                <td>
                  <span class="text-capitalize text-base">{{
                    user.expiry_date
                  }}</span>
                </td>

                <!-- 👉 Description -->
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.description
                  }}</span>
                </td>
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.price
                  }}</span>
                </td>
                <td>
                  
                    <VTextField style="width: 130px;" v-model="user.platform" label="Platform" />
                
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
            <tfoot v-show="!dataPack.length">
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

    <!-- 👉 Add New pack -->
    <VDialog
      style="z-index: 2000 !important"
      v-model="isDialogVisible"
      persistent
      max-width="600"
    >
      <!-- Dialog Content -->
      <VCard title="Add New Package">
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
                v-model="Description"
                :rules="[requiredValidator]"
                label="Description"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="TimeDate"
                type="number"
                :rules="[requiredValidator]"
                label="Date"
              />
            </VCol>
            <VCol cols="12">
              <AppDateTimePicker
                v-model="Expiry_date"
                label="Thời gian hiệu lực"
                :config="{ enableTime: true, dateFormat: 'Y-m-d H:i' }"
            /></VCol>
            <VCol cols="12">
              <VTextField
                v-model="Price"
                :rules="[requiredValidator]"
                label="Price"
              />
            </VCol>
            <VCol cols="12">
              <VAutocomplete
                v-model="Support_ids"
                chips
                closable-chips
                multiple
                :items="supportList"
                item-title="promtName"
                item-value="id"
                label="Select"
              >
                <template #chip="{ props, item }">
                  <VChip
                    v-bind="props"
                    :prepend-id="item.raw.id"
                    :text="item.raw.promtName"
                  />
                </template>

                <template #item="{ props, item }">
                  <VListItem
                    v-bind="props"
                    :title="item?.raw?.promtName"
                  ></VListItem>
                </template>
              </VAutocomplete>
              <!-- <VAutocomplete
                label="Supports"
                :items="supportList.map((item) => item)"
                chips
                multiple
                item-title="promtName"
                item-value="id"
                v-model="Support_ids"
              /> -->
            </VCol>
            <VCol cols="12">
              <VSelect
                chips
                multiple
                v-model="Platform"
                :items="platformLists"
                label="Platform"
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
          Waiting for loading data.....
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

    <!-- 👉 Edit New Pack -->
    <VDialog persistent v-model="isDialogEdit" max-width="600">
      <!-- Edit Dialog -->
      <VCard title="Edit Package">
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
                v-model="Edit.Description"
                :rules="[requiredValidator]"
                label="Description"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                type="number"
                v-model="Edit.TimeDate"
                :rules="[requiredValidator]"
                label="Số ngày của gói"
              />
            </VCol>
            <VCol cols="12">
              <AppDateTimePicker
                v-model="Edit.Expiry_date"
                label="Thời gian hiệu lực"
                :config="{ enableTime: true, dateFormat: 'Y-m-d H:i' }"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="Edit.Price"
                :rules="[requiredValidator]"
                label="Giá"
                type="number"
              />
            </VCol>
            <VCol cols="12">
              <VAutocomplete
                v-model="Edit.Support_ids"
                chips
                closable-chips
                multiple
                :items="supportList"
                item-title="promtName"
                item-value="id"
                label="Select"
              >
                <template #chip="{ props, item }">
                  <VChip
                    v-bind="props"
                    :prepend-id="item.raw.id"
                    :text="item.raw.promtName"
                  />
                </template>

                <template #item="{ props, item }">
                  <VListItem
                    v-bind="props"
                    :title="item?.raw?.promtName"
                  ></VListItem>
                </template>
              </VAutocomplete>
              <!-- <VAutocomplete
                label="Supports"
                :items="supportList"
                chips
                multiple
                item-title="promtName"
                item-value="id"
                v-model="Edit.Support_ids"
              /> -->
            </VCol>
            <VCol cols="12">
              <VCol cols="12">
                <VSelect
                  chips
                  multiple
                  v-model="Edit.Platform"
                  :items="platformLists"
                  label="Platform"
                />
              </VCol>
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
