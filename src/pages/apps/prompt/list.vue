<script setup>
import request from "@/utils/request";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { requiredValidator } from "@validators";
import { onMounted, reactive, watch } from "vue";

const searchQuery = ref("");
const selectedRole = ref();
const selectedPlan = ref();
const selectedStatus = ref();
const rowPerPage = ref(10);
const currentPage = ref(1);
const totalPage = ref(10);
const totalUsers = ref(0);
const dataPrompt = ref([]);
const loading = ref(false);
const apiKey = ref();
const page = ref(1);
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
// 👉 Fetching dataPrompt
const fetchPackage = async () => {
dataPrompt.value = []
  let offset = (page.value - 1);
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/getPromtList.php?key=${apiKey.value}&page=${offset}&limit=${rowPerPage.value}&search=${searchQuery.value}`
    )
    .then((rss) => {
      if (rss.data.status) {
        dataPrompt.value = rss.data.data;
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
// 👉 Fetching dataPrompt
const fetchPackagePag = async (page) => {
  dataPrompt.value = [];
  let offset = (page - 1);
  loading.value = true;
  var data = JSON.parse(localStorage.getItem("user")) || {};
  apiKey.value = data.key;
  await request
    .get(
      `api/getPromtList.php?key=${apiKey.value}&page=${offset}&limit=${rowPerPage.value}&search=${searchQuery.value}`
    )
    .then((rss) => {
      if ((rss.data.status = "success")) {
        dataPrompt.value = rss.data.data;

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

const isAddNewUserDrawerVisible = ref(false);

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Computing pagination data
const paginationData = computed(() => {
  console.log("Test thử", dataPrompt.value);
  const firstIndex =  dataPrompt.value.length
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

// 👉 Delete Prompt
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
      `api/admin/index.php?key=${apiKey.value}&action=prompt_delete`,
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

// 👉 Add Prompt
const _ChuDe = ref();
const _PromtText = ref();
const _chat = ref();
const _input = ref();
const _inputType = ref(["text", "select"]);
const _linkAnh = ref();
const _moTa = ref();
const _promtName = ref();
const _subChuDe = ref();
const _subChuDeEdit = ref();
const _trangThai = ref();
const _typeAI = ref(0);
const subChuDeVal = ref();
const inputTypeVal = ref("select");

const loadingAddUser = ref(false);
const selectItemData = ref([]);
const chuDeList = ref();
const ListChuDe = ref();
const optionsTypeAI = ref([
  { label: "Chat", value: 0 },
  { label: "Hình ảnh", value: 1 },
]);
// const options = ref([
//   {
//     value: 'a1',
//     label: 'a1',
//   },
// ]);
const beforAdd = async () => {
  loadingEdit.value = true;
  //get chủ đề
  try {
    // Gọi cả hai API và chờ cả hai kết quả trả về
    const [res, res2] = await Promise.all([
      request.get(`api/getType.php?type=ChuDe`),
      request.get(`dalle/getPromptType.php?type=chuDe`)
    ]);

    if (res.data.status && res2.data.status) {
      // Ghép mảng từ res2 vào res
      const mergedData = [...res.data.data, ...res2.data.data];
      
      // Lọc các phần tử không rỗng và không undefined
      const filteredData = mergedData.filter((item) => {
        return (item.ChuDe !== undefined && item.ChuDe !== "") || 
               (item.chuDe !== undefined && item.chuDe !== "");
      });

      chuDeList.value = filteredData.map((item) => {
        // Lấy giá trị từ trường ChuDe hoặc chuDe tùy thuộc vào trường nào tồn tại
        return item.ChuDe !== undefined ? item.ChuDe : item.chuDe;
      });

      ListChuDe.value = chuDeList.value; // Gán danh sách chủ đề cho ListChuDe
      
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


// 👉 Watch chủ đề chính get chủ đề con
watch(_ChuDe, async (newVal, oldVal) => {
  loadingEdit.value = true;
  try {
    const res = await request.post(
      "api/getSubChuDe.php",
      JSON.stringify({ chuDe: newVal }),
      {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      }
    );

    loadingEdit.value = false;
    _subChuDe.value = res.data.data;
  } catch (error) {
    console.log(error);
    loadingEdit.value = false;
  }
});

// 👉 Add input Prompt
const dynamicAll = ref([]);
const dynamicValidateForm = reactive({
  input: [],
});
const dynamicSelect = reactive({
  select: [],
});
const removeUser = (item) => {
  const index = dynamicAll.value.indexOf(item);
  if (index !== -1) {
    dynamicAll.value.splice(index, 1);
  }
};
const removeSelect = (item) => {
  const index = dynamicSelect.select.indexOf(item);
  if (index !== -1) {
    dynamicSelect.select.splice(index, 1);
  }
};
const addInput = (type) => {
  if (type == "text") {
    dynamicAll.value.push({
      inputName: "",
      placeholder: "",
    });
  }
  if (type == "select") {
    dynamicAll.value.push({
      inputName: "",
      options: "",
    });
  }
};
const addSelect = () => {
  dynamicSelect.select.push({
    inputName: "",
    options: "",
  });
};
const formRef = ref(null);
let inputToSave = null;
const saveForm = async () => {
  try {
    if (
      !_ChuDe.value ||
      !_PromtText.value ||
      !_chat.value ||
      !_linkAnh.value ||
      !_promtName.value ||
      !subChuDeVal.value ||
      !inputTypeVal.value ||
      !_moTa.value
    ) {
      alert("Please fill in all fields");
      return;
    }
    inputToSave = JSON.stringify(dynamicAll.value);
    loadingAddUser.value = true;
    const response = await request.post(
      `api/addPromtList.php?key=${apiKey.value}`,
      {
        ChuDe: _ChuDe.value,
        PromtText: _PromtText.value,
        chat: _chat.value,
        inputType: inputTypeVal.value,
        linkAnh: _linkAnh.value,
        moTa: _moTa.value,
        promptName: _promtName.value,
        subChuDe: subChuDeVal.value,
        typeAI: _typeAI.value,
        input: inputToSave || "",
      },
      {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/x-www-form-urlencoded",
      }
    );

    if (response.data.status == "success") {
      dynamicAll.valuel = [];
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
const onFinish = async (values) => {
  formRef.value.submit();
};
const beforEdit = async () => {
  loadingEdit.value = true;
  // Get chủ đề
  try {
    const res = await request.get(`api/getType.php?type=ChuDe`);
    const res2 = await request.get(`dalle/getPromptType.php?type=chuDe`)
    if (res.data.status && res2.data.status) {
      // Ghép mảng từ res2 vào res
      const mergedData = [...res.data.data, ...res2.data.data];
      
      // Lọc các phần tử không rỗng và không undefined
      const filteredData = mergedData.filter((item) => {
        return (item.ChuDe !== undefined && item.ChuDe !== "") || 
               (item.chuDe !== undefined && item.chuDe !== "");
      });

      chuDeList.value = filteredData.map((item) => {
        // Lấy giá trị từ trường ChuDe hoặc chuDe tùy thuộc vào trường nào tồn tại
        return item.ChuDe !== undefined ? item.ChuDe : item.chuDe;
      });
      console.log("chuDeList.value_____", chuDeList.value);

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
  _ChuDe.value = ""; // Clear title field
  _PromtText.value = ""; // Clear Description field
  inputTypeVal.value = ""; // Clear TimeDate field
  _moTa.value = ""; // Clear Expiry_date field
  _promtName.value = ""; // Clear Price field
  subChuDeVal.value = ""; // Clear Support_ids field
  _typeAI.value = ""; // Clear Platform field
  inputToSave = null;
};

// 👉 Edit Package
const loadingEdit = ref(false);
const isDialogEdit = ref(false);
const Edit = ref({
  ChuDe: "",
  PromtText: "",
  chat: "",
  inputType: "",
  linkAnh: "",
  moTa: "",
  promptName: "",
  subChuDe: "",
  typeAI: "",
  input: "",
  trangThai: null,
});

function resetEditValues() {
  Edit.value.ChuDe = "";
  Edit.value.PromtText = "";
  Edit.value.chat;
  Edit.value.inputType = "";
  Edit.value.linkAnh = "";
  Edit.value.moTa = "";
  Edit.value.promptName = "";
  Edit.value.subChuDe = "";
  Edit.value.typeAI = "";
  Edit.value.input = "";
  Edit.value.trangThai = null;
}
watch(
  () => Edit.value.ChuDe,
  async (newVal, oldVal) => {
    // Đảm bảo giá trị mới không trống và không phải là giá trị mặc định
    if (newVal && newVal !== oldVal) {
      loadingEdit.value = true;
      try {
        const res = await request.post(
          "api/getSubChuDe.php",
          JSON.stringify({ chuDe: newVal }),
          {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          }
        );

        loadingEdit.value = false;
        _subChuDeEdit.value = res.data.data;
      } catch (error) {
        console.log(error);
        loadingEdit.value = false;
      }
    }
  },
  { deep: true }
);
// 👉 Options Edit
const dynamicValidateFormEdit = reactive({
  input: [],
});
const dynamicSelectEdit = reactive({
  select: [],
});
const removeUserEdit = (item) => {
  const index = Edit.value.input.indexOf(item);
  if (index !== -1) {
    Edit.value.input.splice(index, 1);
  }
};
const removeSelectEdit = (item) => {
  const index = dynamicSelectEdit.select.indexOf(item);
  if (index !== -1) {
    dynamicSelectEdit.select.splice(index, 1);
  }
};
const addInputEdit = () => {
  if (Edit.value.inputType == "text") {
    Edit.value.input.push({
      inputName: "",
      placeholder: "",
    });
  }
  if (Edit.value.inputType == "select") {
    Edit.value.input.push({
      inputName: "",
      options: "",
    });
  }
};
const stt = ref(["private", "public"]);
const idPackEdit = ref();
const prListEditVal = ref();
const showEdit = async (id) => {
  resetEditValues();
  const prListEdit = await beforEdit();
  idPackEdit.value = id;
  loadingEdit.value = true;
  try {
    const res = await request.get(
      `api/getPromtList.php?key=${apiKey.value}&searchid=${idPackEdit.value}`
    );
    if ((res.data.status = "success")) {
      const data = res.data.data[0];
      Edit.value.ChuDe = data.ChuDe;
      Edit.value.PromtText = data.PromtText;
      Edit.value.chat = data.chat;
      Edit.value.inputType = data.inputType;
      Edit.value.linkAnh = data.linkAnh;
      Edit.value.moTa = data.moTa;
      Edit.value.promptName = data.promtName;
      Edit.value.subChuDe = data.subChuDe;
      Edit.value.typeAI = data.typeAI;
      Edit.value.trangThai = data.trangThai;
      // Edit.value.input = dl;
      const DI = JSON.parse(data.input);

      Edit.value.input = DI;

      // if (data.inputType == "select") {
      //   DI.map((item) => {
      //     dynamicSelectEdit.select.push({
      //       inputName: item.inputName,
      //       options: item.options,
      //     });
      //   });
      // } else if (data.inputType == "text") {
      //   DI.map((item) => {
      //     dynamicValidateFormEdit.input.push({
      //       inputName: item.inputName,
      //       placeholder: item.placeholder,
      //     });
      //   });
      // }
      // console.log("dynamicSelectEdit.select___", dynamicSelectEdit.select);
      // console.log(
      //   "dynamicValidateFormEdit.input",
      //   dynamicValidateFormEdit.input
      // );
      loadingEdit.value = false;
      isDialogEdit.value = true;
    }
    loadingEdit.value = false;
  } catch (error) {
    console.log(error);
    loadingEdit.value = false;
  }
};

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
    if (
      !Edit.value.ChuDe ||
      !Edit.value.PromtText ||
      !Edit.value.linkAnh ||
      !Edit.value.chat ||
      !Edit.value.inputType ||
      !Edit.value.moTa ||
      !Edit.value.promptName ||
      !Edit.value.subChuDe
    ) {
      alert("Please fill in all fields");
      return;
    }
    loadingAddUser.value = true;
    const inputToSaveEdit = Edit.value.input;
    loadingAddUser.value = true;
    const res = await request.post(
      `api/editPromt.php?key=${apiKey.value}`,
      {
        ChuDe: Edit.value.ChuDe,
        PromtText: Edit.value.PromtText,
        chat: Edit.value.chat,
        idCard: idPackEdit.value,
        input: inputToSaveEdit || "",
        inputType: Edit.value.inputType,
        linkAnh: Edit.value.linkAnh,
        moTa: Edit.value.moTa,
        promptName: Edit.value.promptName,
        subChuDe: Edit.value.subChuDe,
        trangThai: Edit.value.trangThai,
        typeAI: Edit.value.typeAI,
      },
      {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/x-www-form-urlencoded",
      }
    );
    if (res.data.status == "success") {
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
const role = ref(0);
// 👉 OnMounted
onMounted(async () => {
  // await beforEdit();
  const dataRole = JSON.parse(localStorage.getItem("user")) || {};

  
  role.value = dataRole.level;
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
      <a-modal v-model:open="open" title="Delete Prompt" @ok="handleOk">
        <p>Bạn có chắc muốn xoá Prompt này?</p>
      </a-modal>
    </div>
    <VRow>
 

      <VCol cols="12">
        <VCard title="Quản lý Prompt">
          <VDivider />

          <VCardText class="d-flex flex-wrap gap-4">
            <!-- 👉 Export button -->
            <!-- 👉 Search  -->
            <VCol cols="12" sm="6">
              <VTextField
                v-model="searchQuery"
                placeholder="Tên Prompt"
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
            <VSpacer />

            <div class="d-flex align-center">
              <!-- 👉 Add Prompt button -->
              <VBtn @click="beforAdd"> Thêm Prompt </VBtn>
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
                      dataPrompt.length !== selectedRows.length &&
                      !!selectedRows.length
                    "
                    class="mx-1"
                    @click="selectUnselectAll"
                  />
                </th> -->
                <th scope="col">STT</th>
                <th scope="col">Tên Prompt</th>
                <th scope="col">Mô tả</th>
                <th scope="col">Chat</th>
                <th scope="col">Chủ đề</th>
                <th scope="col">Chủ đề con</th>
                <th scope="col">Lượt thích</th>
                <th scope="col">typeAI</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">Hành động</th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
              <tr v-for="(user, index) in dataPrompt" :key="index">
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
                    {{ currentPage <= 0 ? 0 * rowPerPage + index + 1 : (currentPage - 1) * rowPerPage + index + 1 }}                 </div>
                </td>
                <td>
                  <div class="d-flex align-center">
                    <div class="d-flex flex-column">
                      <h6 class="text-sm">
                        {{ user.promtName }}
                      </h6>
                    </div>
                  </div>
                </td>

                <!-- 👉 Mô tả Prompt -->
                <td>
                  <VTextarea 
                    style="width: 180px"
                    v-model="user.moTa"
                    label=""
                  />
                </td>
                <td>
                  <VTextarea 
                    style="width: 180px"
                    v-model="user.chat"
                    label=""
                  />
                </td>

                <!-- 👉 Description -->
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.ChuDe
                  }}</span>
                </td>
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.subChuDe
                  }}</span>
                </td>
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.likePromt
                  }}</span>
                </td>
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.typeAI == 0 ? "GPT" : "Hình ảnhs"
                  }}</span>
                </td>
                <td>
                  <span class="text-base text-high-emphasis">{{
                    user.trangThai
                  }}</span>
                </td>

                <!-- 👉 Actions -->
                <td class="text-center" style="width: 80px">
                  <VBtn  @click="showEdit(user.id)" color="warning" style="margin-right: 8px">
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
            <tfoot v-show="!dataPrompt.length">
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
            <div class="d-flex align-center" style="width: 200px">
              <span class="text-no-wrap text-sm me-3">Dòng trên mỗi trang:</span>
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

    <!-- 👉 Add New Prompt -->
    <VDialog v-model="isDialogVisible" persistent max-width="600">
      <!-- Dialog Content -->
      <VCard title="Thêm mới Prompt">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isDialogVisible = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="_linkAnh"
                label="Link Ảnh"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="12">
              <VSelect :items="chuDeList" v-model="_ChuDe" label="Chủ đề" />
              <!-- Chủ đề -->
            </VCol>
            <VCol cols="12">
              <!-- Chủ đề con -->

              <VSelect
                :items="_subChuDe"
                v-model="subChuDeVal"
                label="Chủ đề Con"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="_promtName"
                label="Tên Prompt"
                :rules="[requiredValidator]"
            /></VCol>
            <VCol cols="12">
              <VTextarea 
                v-model="_PromtText"
                label="Thêm Prompt"
                :rules="[requiredValidator]"
            /></VCol>
            <VCol cols="12">
              <VTextField
                v-model="_moTa"
                label="Mô tả"
                :rules="[requiredValidator]"
            /></VCol>
            <VCol cols="12">
              <VTextField
                v-model="_chat"
                label="CHAT"
                :rules="[requiredValidator]"
            /></VCol>
            <VCol cols="12">
              <VSelect
                :items="optionsTypeAI"
                label="Type AI"
                v-model="_typeAI"
                item-title="label"
                item-value="value"
              />
            </VCol>
            <VCol cols="12">
              <!-- Chủ đề con -->

              <VSelect
                :items="_inputType"
                v-model="inputTypeVal"
                label="Kiểu Input"
              />
            </VCol>
            <VCol cols="12">
              <h1 v-if="inputTypeVal == 'number'">Number</h1>
              <div>
                <a-space
                  v-for="(user, index) in dynamicAll"
                  :key="index"
                  style="display: flex; margin-bottom: 8px"
                  align="baseline"
                >
                  <a-input v-model:value="user.inputName" placeholder="Input" />

                  <a-input
                    v-if="inputTypeVal == 'text'"
                    v-model:value="user.placeholder"
                    placeholder="Value"
                  />
                  <a-select
                    v-if="inputTypeVal == 'select'"
                    v-model:value="user.options"
                    mode="tags"
                    style="width: 120px"
                    placeholder="Tags Mode"
                    @change="handleChange"
                  ></a-select>
                  <MinusOutlined @click="removeUser(user)" />
                </a-space>
                <a-button type="dashed" block @click="addInput(inputTypeVal)">
                  <PlusOutlined />
                  Thêm Input
                </a-button>
              </div>

              <!-- Select 
              <div v-if="inputTypeVal == 'select'">
                <a-space
                  v-for="(user, index) in dynamicSelect.select"
                  :key="index"
                  style="display: flex; margin-bottom: 8px"
                  align="baseline"
                >
                  <a-input v-model:value="user.inputName" placeholder="Value" />

                  <div>
                    <a-select
                      v-model:value="user.options"
                      mode="tags"
                      style="width: 120px"
                      placeholder="Tags Mode"
                      @change="handleChange"
                    ></a-select>
                  </div>

                  <MinusOutlined @click="removeSelect(user)" />
                </a-space>

                <a-button type="dashed" block @click="addSelect">
                  <PlusOutlined />
                  Add Input
                </a-button>
              </div> -->
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="d-flex justify-end gap-2">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="isDialogVisible = false"
          >
            Đóng
          </VBtn>
          <VBtn @click="saveForm"> Lưu </VBtn>
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

    <!-- 👉 Edit New Prompt -->
    <VDialog v-model="isDialogEdit" persistent max-width="600">
      <!-- Dialog Content -->
      <VCard title="Chỉnh sửa Prompt">
        <DialogCloseBtn
          variant="text"
          size="small"
          @click="isDialogEdit = false"
        />

        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="Edit.linkAnh"
                label="Link Ảnh"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="12">
              <VSelect :items="chuDeList" v-model="Edit.ChuDe" label="Chủ đề" />
              <!-- Chủ đề -->
            </VCol>
            <VCol cols="12">
              <!-- Chủ đề con -->

              <VSelect
                :items="_subChuDeEdit"
                v-model="Edit.subChuDe"
                label="Chủ đề Con"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="Edit.promptName"
                label="Tên Prompt"
                :rules="[requiredValidator]"
            /></VCol>
            <VCol cols="12">
              <VTextarea 
                v-model="Edit.PromtText"
                label="Sửa Prompt"
                :rules="[requiredValidator]"
            /></VCol>
            <VCol cols="12">
              <VTextField
                v-model="Edit.moTa"
                label="Mô tả"
                :rules="[requiredValidator]"
            /></VCol>
            <VCol cols="12">
              <VTextField
                v-model="Edit.chat"
                label="CHAT"
                :rules="[requiredValidator]"
            /></VCol>
            <VCol cols="12">
              <VSelect
                :items="optionsTypeAI"
                label="Type AI"
                v-model="Edit.typeAI"
                item-title="label"
                item-value="value"
              />
            </VCol>
            <VCol cols="12">
              <VSelect
                :items="stt"
                label="Trạng Thái"
                v-model="Edit.trangThai"
              />
            </VCol>
            <VCol cols="12">
              <!-- Chủ đề con -->

              <VSelect
                :items="_inputType"
                v-model="Edit.inputType"
                label="Kiểu Input"
              />
            </VCol>
            <VCol cols="12">
              <div>
                <a-space
                  v-for="(user, index) in Edit.input"
                  :key="index"
                  style="display: flex; margin-bottom: 8px"
                  align="baseline"
                >
                  <div v-if="user.placeholder != null" style="display: flex">
                    <a-input
                      style="height: 60px; margin-right: 8px"
                      v-model:value="user.inputName"
                      placeholder="Input"
                    />

                    <a-input
                      style="height: 60px; margin-right: 8px"
                      v-model:value="user.placeholder"
                      placeholder="Value"
                    />
                  </div>
                  <div v-if="user.options != null" style="display: flex">
                    <a-input
                      style="height: 60px; margin-right: 8px"
                      v-model:value="user.inputName"
                      placeholder="Input"
                    />
                    <a-select
                      v-model:value="user.options"
                      mode="tags"
                      style="width: 120px"
                      placeholder="Tags Mode"
                    ></a-select>
                  </div>

                  <MinusOutlined @click="removeUserEdit(user)" />
                </a-space>
                <a-button type="dashed" block @click="addInputEdit">
                  <PlusOutlined />
                 Thêm Input
                </a-button>
              </div>
            </VCol>
          </VRow>
        </VCardText>
        <VCardText class="d-flex justify-end gap-2">
          <VBtn color="secondary" variant="tonal" @click="isDialogEdit = false">
            Đóng
          </VBtn>
          <VBtn @click="SaveEdit()"> Lưu </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>

<style lang="scss" scoped>
.app-user-search-filter {
  inline-size: 385px;
}
// .ant-form-item .css-dev-only-do-not-override-1hsjdkk:nth-child(2) {
//   width: 100%;
//   display: flex;
//   justify-content: end;
// }
.text-capitalize {
  text-transform: capitalize;
}
body
  > div:nth-child(5)
  > div
  > div
  > div
  > div.rc-virtual-list
  > div.rc-virtual-list-holder
  > div
  > div
  > div
  > div {
  z-index: 20000 !important;
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
