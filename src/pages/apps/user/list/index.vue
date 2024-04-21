<script setup>
import ThongKeUser from "@/pages/components/thongke.vue";
import request from "@/utils/request";
import { emailValidator, requiredValidator } from "@validators";
import { addMonths } from "date-fns";
import { onMounted, watch } from "vue";

const searchQuery = ref("");
const selectedRole = ref("");
const selectedPlan = ref();
const selectedStatus = ref();
const rowPerPage = ref(10);
const currentPage = ref(1);
const totalPage = ref(10);
const totalUsers = ref(0);
const users = ref([]);
const loading = ref(false);
const apiKey = ref();
const page = ref(1);
const show1 = ref(false);

const isDialogVisible = ref(false);

const pageSize = ref(0);

page.value = currentPage.value;
// 👉 Fetching users
const fetchUsers = async () => {
  // console.log("selectedRole.value______>", selectedRole.value);
  loading.value = true;
  let offset = (page.value - 1);

  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/getAllUser.php?key=${apiKey.value}&page=${offset}&limit=${rowPerPage.value}&search=${searchQuery.value}&level=${selectedRole.value}&date=${DateHH.value}`
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
  // selectedRole.value = "";
  selectedPlan.value = "all";
};
// 👉 Fetching users
const fetchUsersPag = async (page) => {
  loading.value = true;
  let offset = (page - 1);
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/getAllUser.php?key=${apiKey.value}&page=${offset}&limit=${rowPerPage.value}&search=${searchQuery.value}&level=${selectedRole.value}&date=${DateHH.value}`
    )
    .then((rss) => {
      if (rss.data.success) {
        users.value = rss.data.data;
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
  // selectedRole.value = "all";
  // selectedPlan.value = "all";
};

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});
watch(currentPage, (newVal, oldVal) => {
  fetchUsersPag(newVal);
});
const searchRoles = ref("");
// 👉 search filters
const roles = ref([
  {
    title: "Tất cả",
    value: "",
  },
  {
    title: "Admin",
    value: 0,
  },
  {
    title: "Nhân viên",
    value: 1,
  },
  {
    title: "Đại lý",
    value: 2,
  },
  {
    title: "Cộng tác viên",
    value: 3,
  },
  {
    title: "Người dùng",
    value: 4,
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

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = users.value.length
    ? (currentPage.value - 1) * rowPerPage.value + 1
    : 0;
  const lastIndex =  currentPage.value * rowPerPage.value;

  return `${firstIndex}-${lastIndex} of ${totalPage.value}`;
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
const maGioiThieuDaiLy = ref();
const quyenUser = ref();
const loadingAddUser = ref(false);
const userName = ref();
const password = ref("");
const email = ref("");
const items = ref([
  { label: "Admin", value: 0 },
  { label: "Nhân viên", value: 1 },
  { label: "Đại lý", value: 2 },
  { label: "Cộng tác viên", value: 3 },
  { label: "Người dùng", value: 4 },
]);
const addUser = async () => {
  let objmgt = {};
  if (quyenUser.value == 2 || quyenUser.value == 3) {
    if (!maGioiThieuDaiLy.value) {
      alert("Mã giới thiệu không được để trống!");
      return;
    } else {
      objmgt = {
        maGioiThieu: maGioiThieuDaiLy.value,
      };
    }
  } else {
    if (!maGioiThieuAdd.value) {
      alert("Mã giới thiệu không được để trống!");
      return;
    } else {
      objmgt = {
        maGioiThieu: maGioiThieuAdd.value,
      };
    }
  }
  let dataForm = new FormData();
  dataForm.append("user", userName.value);
  dataForm.append("pass", password.value);
  dataForm.append("mail", email.value);
  dataForm.append("maGioiThieu", objmgt.maGioiThieu);
  dataForm.append("role", quyenUser.value);
  try {
    loadingAddUser.value = true;
    const response = await request.post("api/reg_acc.php", dataForm);
    if (response.data.status === "success") {
      loadingAddUser.value = false;
      isDialogVisible.value = false;
      fetchUsers();
      pushNotiSuccess();
    } else {
      pushNotiError();
    }
    isDialogVisible.value = false;
    loadingAddUser.value = false;
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
const AgencyMGT = ref();
const Edit = ref({
  email1: "",
  userName1: "",
  password1: "",
  maGioiThieuAdd1: "",
  ngayDangKy1: "",
  ngayHetHan1: "",
  goiDangKy1: "",
  AgencyMGT: "",
  phone:""
});
function resetEditValues() {
  Edit.value.email1 = "";
  Edit.value.userName1 = "";
  Edit.value.password1 = "";
  Edit.value.maGioiThieuAdd1 = "";
  Edit.value.ngayDangKy1 = "";
  Edit.value.ngayHetHan1 = "";
  Edit.value.goiDangKy1 = "";
  Edit.value.phone = "";
  selectedQuyen.value = "";
}
const reduce = ref();

const idUserEdit = ref();
const selectedQuyen = ref();
const addMgtDaily = async () => {
  try {
    loadingAddUser.value = true;
    const res = await request.post(
      `api/admin/index.php?key=${apiKey.value}&action=add_agency`,
      {
        id_user: idUserEdit.value,
        maGioiThieu: AgencyMGT.value,
        role: selectedQuyen == 2 ? 0 : 1,
        reduce: reduce.value,
      }
    );
    if (res.data.status) {
      loadingAddUser.value = false;
      pushNotiSuccess();
    }
  } catch (error) {
    pushNotiError();
    loadingAddUser = false;
    console.log(error);
  }
};
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

      console.log(data.user);
      Edit.value.email1 = data.user.mail;
      Edit.value.userName1 = data.user.user;
      Edit.value.password1 = "";
      Edit.value.maGioiThieuAdd1 = data.user.maGioiThieu;
      Edit.value.ngayDangKy1 = data.user.thoiGianDangKy;
      Edit.value.ngayHetHan1 = data.user.thoiGianHetHan;
      Edit.value.phone = data.user.phone;
      selectedQuyen.value = data.user.level;
      AgencyMGT.value = data.user.acency?.maGioiThieu;
      Edit.value.goiDangKy1 = data.service || "Chưa đăng ký dịch vụ nào";
      loadingEdit.value = false;
      isDialogEdit.value = true;
    }
    loadingEdit.value = false;
  } catch (error) {
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
        phone: Edit.value.phone
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
      isDialogEdit.value = false;
      fetchUsers()

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

const listService = ref();
const packforUser = ref();
const Expiry_date_pack = ref();
const Price_pack = ref();
const resetFielPack = () => {
  listService.value = "";
  packforUser.value = "";
  Expiry_date_pack.value = "";
  Price_pack.value = "";
};
const getListServiceNew = async () => {
  loadingAddUser.value = true;

  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&page=${page.value}&limit=${rowPerPage.value}&search=${searchQuery.value}&action=pack_list`
    )
    .then((rss) => {
      if (rss.data.status) {
        listService.value = rss.data.data;
        isNewService.value = true;
        loadingAddUser.value = false;
      }
      loading.value = false;
      loadingAddUser.value = false;
    })
    .catch((error) => {
      loading.value = false;
      loadingAddUser.value = false;
      console.log(error);
    });
};
const getListServiceEdit = async () => {
  loadingAddUser.value = true;

  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&page=${page.value}&limit=${rowPerPage.value}&search=${searchQuery.value}&action=pack_list`
    )
    .then((rss) => {
      if (rss.data.status) {
        listService.value = rss.data.data;
        isEditPack.value = true;
        loadingAddUser.value = false;
      }
      loading.value = false;
      loadingAddUser.value = false;
    })
    .catch((error) => {
      loading.value = false;
      loadingAddUser.value = false;
      console.log(error);
    });
};

const isEditPack = ref(false);

const idUsEditService = ref();
const EditService = async (id) => {
  idUsEditService.value = id;
  getUserById(idUsEditService.value);
  getListServiceEdit();

};
const EditPackID = ref();
const EditPackprice = ref();
const EditPackTime = ref();
const UserFService = ref();
const idServiceToEdit = ref();
const HardTime = ref();
const getUserById = async (id) => {
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(`api/getAllUser.php?key=${apiKey.value}&id_user=${id}`)
    .then((rss) => {
      if (rss.data.success) {
        console.log("rss.data.data", rss.data.data);
        UserFService.value = rss.data.data;

        EditPackID.value = rss.data.data[0].services[0].id_pack;
        idServiceToEdit.value = rss.data.data[0].services[0].id;
        EditPackprice.value = rss.data.data[0].services[0].price;
        EditPackTime.value = rss.data.data[0].services[0].expiry_date;
        HardTime.value = rss.data.data[0].services[0].expiry_date;
        loading.value = false;
      }
      loading.value = false;
    })
    .catch((error) => {
      loading.value = false;
      // console.log(error);
    });
};

const EditServiceForUser = async () => {
  var data = JSON.parse(localStorage.getItem("user")) || {};

  apiKey.value = data.key;
  await request
    .post(`api/admin/index.php?key=${apiKey.value}&action=update_service`, {
      id: idServiceToEdit.value,
      id_user: idUsEditService.value,
      id_pack: EditPackID.value,
      expiry_date: EditPackTime.value,
      price: EditPackprice.value,
    })
    .then((rss) => {
      if (rss.data.status) {
        dataDateTime.value = null;
        pushNotiSuccess();
        fetchUsers();
        isEditPack.value = false;
        loadingAddUser.value = false;
      }
      loading.value = false;
      loadingAddUser.value = false;
    })
    .catch((error) => {
      loading.value = false;
      loadingAddUser.value = false;
      console.log(error);
      pushNotiError();
    });
};

const isNewService = ref(false);
const idUsNewService = ref();
const NewService = async (id) => {
  idUsNewService.value = id;
  resetFielPack();
  getListServiceNew();
};
const addNewServiceForUser = async () => {
  var data = JSON.parse(localStorage.getItem("user")) || {};

  apiKey.value = data.key;
  await request
    .post(`api/admin/index.php?key=${apiKey.value}&action=add_service`, {
      id_user: idUsNewService.value,
      id_pack: packforUser.value.id,
      expiry_date: Expiry_date_pack.value,
      price: Price_pack.value,
    })
    .then((rss) => {
      if (rss.data.status) {
        pushNotiSuccess();
        fetchUsers();
        isNewService.value = false;
        loadingAddUser.value = false;
      }
      loading.value = false;
      loadingAddUser.value = false;
    })
    .catch((error) => {
      loading.value = false;
      loadingAddUser.value = false;
      console.log(error);
      pushNotiError();
    });
};
const openDeleteSv = ref(false);
const idDeletePaCk = ref();
const beforeDelete = (id) => {
  idDeletePaCk.value = id;
  openDeleteSv.value = true;
};
const DeletePack = async () => {
  var data = JSON.parse(localStorage.getItem("user")) || {};

  apiKey.value = data.key;
  await request
    .post(`api/admin/index.php?key=${apiKey.value}&action=delete_service`, {
      id: idDeletePaCk.value,
    })
    .then((rss) => {
      if (rss.data.status) {
        pushNotiSuccess();
        fetchUsers();
        openDeleteSv.value = false;
        loadingAddUser.value = false;
      }
      loading.value = false;
      loadingAddUser.value = false;
    })
    .catch((error) => {
      loading.value = false;
      loadingAddUser.value = false;
      console.log(error);
      pushNotiError();
    });
};
const dataDateTime = ref("");
const selectTime = ref([
  { label: "Thêm 1 tháng", value: 1 },
  { label: "Thêm 2 tháng", value: 2 },
  { label: "Thêm 3 tháng", value: 3 },
  { label: "Thêm 6 tháng", value: 6 },
  { label: "Thêm 1 năm", value: 12 },
]);
const FuncVal = ref();
const listFunc = ref([
  { label: "Người dùng hết hạn", value: 1 },
  // { label: "Đang phát triển", value: 2 },
  // { label: "Đang phát triển", value: 3 },
]);
const DateHH = ref();
watch(dataDateTime, (newValue, oldVal) => {
  if (newValue !== null && newValue !== undefined) {
    console.log("EditPackTime", EditPackTime.value);
    // Chuyển đổi EditPackTime thành đối tượng Date
    const currentDate = new Date(HardTime.value);
    // Kiểm tra nếu EditPackTime nhỏ hơn ngày hiện tại
    if (currentDate < new Date()) {
      // Lấy ngày hiện tại để cộng
      currentDate = new Date();
    }
    // Cộng số tháng tương ứng với newValue vào EditPackTime
    EditPackTime.value = addMonths(currentDate, newValue);
    console.log("EditPackTime", EditPackTime.value);
  }
});
const callItBack = () => {
  DateHH.value = undefined;
};
const addTime = async () => {
  loading.value = true;
  try {
  } catch (error) {
    loading.value = false;
    console.log(error);
  }
};
// 👉 OnMounted
const role = ref(0);
onMounted(() => {
  const dataRole = JSON.parse(localStorage.getItem("user")) || {};
  role.value = dataRole.level;
  fetchUsers();
});
</script>

<template>
  <section v-if="role != 0 && role != 1">
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
      <a-modal v-model:open="open" title="Delete User" @ok="handleOk">
        <p>Bạn có chắc muốn xoá User này?</p>
      </a-modal>
    </div>
    <div>
      <a-modal v-model:open="openDeleteSv" title="Delete Gói" @ok="DeletePack">
        <p>Bạn có chắc muốn xoá gói dịch vụ cho User này?</p>
      </a-modal>
    </div>
    <VRow>
      <ThongKeUser />

      <VCol cols="12">
        <VCard title="Lọc người dùng">
          <VCardText>
            <VRow style="justify-content: flex-start">
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

              <VCol cols="12" sm="3">
                <VSelect
                  v-model="FuncVal"
                  label="Chọn chức năng"
                  :items="listFunc"
                  item-title="label"
                  item-value="value"
                  clearable
                  clear-icon="bx-x"
                  @click:clear="callItBack()"
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
              <!-- 👉 Search  -->
              <VCol cols="12" sm="2" v-if="FuncVal == 1">
                <VTextField
                  v-model="DateHH"
                  placeholder="Nhập số ngày"
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
                <th scope="col">User Name</th>
                <th scope="col">Email</th>
                <th scope="col">Quốc Gia</th>
                <th scope="col">SĐT</th>
                <th scope="col">Ngày Đăng Ký</th>
                <th scope="col">Ngày Hết Hạn</th>
                <th scope="col">Gói Đăng Ký</th>
                <th scope="col">Quyền</th>
                <th scope="col">Mã Giới Thiệu</th>
                <th scope="col" v-if="role == 0">ACTIONS</th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr v-for="(user, index) in users" :key="index">
                <!-- 👉 User -->
                <td>
                  <div class="d-flex align-center">
                    {{ currentPage <= 0 ? 0 * rowPerPage + index + 1 : (currentPage - 1) * rowPerPage + index + 1 }}
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
                <!-- 👉 Email -->
                <td>
                  <span class="text-capitalize text-base">{{ user.mail }}</span>
                </td>
                <!-- 👉 Country -->
                <td>
                  <span class="text-capitalize text-base">{{
                    user.country
                  }}</span>
                </td>

                <!-- 👉 Phone -->
                <td>
                  <span class="text-capitalize text-base">{{
                    user.phone
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
                    user.services && user.services.length > 0
                      ? user.services[0].expiry_date
                      : "Chưa đăng ký gói cước"
                  }}</span>
                </td>

                <!-- 👉 Gói Đăng Ký -->
                <td>
                  {{ user.services[0]?.pack_title || "Không có gói nào" }}
                  <!-- <VIcon
                    v-if="user.services[0]?.pack_title"
                    icon="bxs-edit"
                    @click="EditService(user.id)"
                  />
                  <VIcon v-else icon="bxs-edit" @click="NewService(user.id)" /> -->

                  <a-dropdown>
                    <VIcon icon="bx-dots-vertical-rounded" />
                    <template #overlay>
                      <a-menu>
                        <a-menu-item
                          key="0"
                          v-if="!user.services[0]?.pack_title"
                        >
                          <VBtn color="success" @click="NewService(user.id)">
                            <VIcon icon="bx-folder-plus" />
                          </VBtn>
                        </a-menu-item>
                        <a-menu-item key="1">
                          <VBtn color="warning" @click="EditService(user.id)">
                            <VIcon icon="bx-edit-alt" />
                          </VBtn>
                        </a-menu-item>
                        <a-menu-item
                          key="2"
                          v-if="user.services[0]?.pack_title"
                        >
                          <VBtn
                            @click="beforeDelete(user.services[0]?.id)"
                            color="error"
                          >
                            <VIcon icon="bx-trash" />
                          </VBtn>
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </td>
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.level === 0
                      ? "Admin"
                      : user.level === 1
                      ? "Nhân viên"
                      : user.level === 2
                      ? "Đại lý"
                      : user.level === 3
                      ? "CTV"
                      : user.level === 4
                      ? "Người dùng"
                      : "Unknown"
                  }}</span>
                </td>

                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.maGioiThieu
                  }}</span>
                </td>

                <!-- 👉 Actions -->
                <td v-if="role == 0" class="text-center" style="width: 80px">
                  <VBtn
                    @click="showEdit(user.id)"
                    color="warning"
                    style="margin-right: 8px"
                  >
                    <VIcon icon="bxs-edit" />
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
    <!-- 👉 Add New Pack -->
    <VDialog
      persistent
      v-model="isNewService"
      max-width="600"
      style="z-index: 2000"
    >
      <!-- Dialog Content -->
      <VCard title="Add gói mới">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isNewService = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VSelect
                v-model="packforUser"
                :items="listService"
                label="Danh sách gói"
                item-title="title"
                item-value="id"
                return-object
              />
            </VCol>
            <VCol cols="12">
              <AppDateTimePicker
                v-model="Expiry_date_pack"
                label="Thời gian hết hạn"
                :config="{ enableTime: true, dateFormat: 'Y-m-d' }"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="Price_pack"
                :rules="[requiredValidator]"
                label="Giá gói"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="d-flex justify-end gap-2">
          <VBtn color="secondary" variant="tonal" @click="isNewService = false">
            Close
          </VBtn>
          <VBtn @click="addNewServiceForUser"> Save </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
    <!-- 👉 Edit Pack for User -->
    <VDialog
      persistent
      v-model="isEditPack"
      max-width="600"
      style="z-index: 2000"
    >
      <!-- Dialog Content -->
      <VCard title="Edit Dịch vụ">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isEditPack = false"
        />
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VSelect
                v-model="EditPackID"
                :items="listService"
                label="Danh sách gói"
                item-title="title"
                item-value="id"
              />
            </VCol>
            <VCol cols="12">
              <AppDateTimePicker
                v-model="EditPackTime"
                label="Thời gian hết hạn"
                :config="{ enableTime: true, dateFormat: 'Y-m-d' }"
              />
            </VCol>

            <VCol col="8">
              <VSelect
                v-model="dataDateTime"
                :items="selectTime"
                label="Thêm thời hạn gói"
                item-title="label"
                item-value="value"
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="EditPackprice"
                :rules="[requiredValidator]"
                label="Giá gói"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="d-flex justify-end gap-2">
          <VBtn color="secondary" variant="tonal" @click="isEditPack = false">
            Close
          </VBtn>
          <VBtn @click="EditServiceForUser"> Save </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

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
              <VTextField
                v-model="userName"
                label="Username"
                :rules="[requiredValidator]"
              />
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
              <VSelect
                v-model="quyenUser"
                :items="items"
                label="Quyền"
                item-title="label"
                item-value="value"
              />
            </VCol>
            <VCol cols="12" v-if="quyenUser == 2 || quyenUser == 3">
              <VTextField
                v-model="maGioiThieuDaiLy"
                label="Mã giới thiệu cho đại lý và cộng tác viên"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="12" v-if="quyenUser == 2 || quyenUser == 3">
              <VTextField
                v-model="reduce"
                label="Giá tiền"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="12" v-else>
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
            <!-- <VCol cols="12">
        
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
            </VCol> -->
            <VCol cols="12">
              <VSelect
                :items="items"
                label="Quyền"
                v-model="selectedQuyen"
                item-title="label"
                item-value="value"
              />
            </VCol>

            <VRow
              v-if="selectedQuyen == 2 || selectedQuyen == 3"
              style="padding: 12px"
            >
              <VCol cols="5">
                <VTextField
                  v-model="AgencyMGT"
                  label="Mã giới thiệu cho đại lý và cộng tác viên"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="5">
                <VTextField
                  v-model="reduce"
                  label="Giá tiền"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="2">
                <VBtn color="primary" @click="addMgtDaily">
                  <VIcon icon="bx-add-to-queue" />
                </VBtn>
              </VCol>
            </VRow>
            <VCol cols="12">
              <VTextField
                v-model="Edit.phone"
                label="Số điện thoại"
                :rules="[requiredValidator]"
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
