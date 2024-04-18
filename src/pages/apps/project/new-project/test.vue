<script setup>
import request from "@/utils/request";
import { ref, watch } from "vue";

const newUser = ref("");
const selectedRole = ref();
const selectedPlan = ref();
const selectedStatus = ref();
const rowPerPage = ref(10);
const currentPage = ref(1);
const totalPage = ref(1);
const totalUsers = ref(0);
const Stop = ref();
const progressStop = ref(false);
const progressLogin = ref(false);
const successStatus = ref(false);
const errorStatus = ref(false);
const dataSubject = ref("");
const lido = ref("");
const saveForm = ref([]);
const showForm = ref();
// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});
watch(showForm, (oldVAlue, newvALUE) => {
  saveForm.value = [];
  for (var temp of dataSubject.value[showForm.value].data) {
    saveForm.value.push({
      id: temp.id,
      name: temp.title,
      option: "",
    });
  }
});
watchEffect(() => {});
//👉 generateObjectId  -->
const generateObjectId = () => {
  const userString = localStorage.getItem("user") || null;
  if (userString) {
    const userObject = JSON.parse(userString);
    const payload = userObject.payload;
    const timestamp = Date.now();
    const object_id = `${payload.user_id}_${timestamp}`;
    return object_id;
  } else {
    // Xử lý khi không có dữ liệu trong localStorage
    return null;
  }
};
const panel = ref(1);

//👉 OnMounted  -->
onMounted(() => {
  getSubject();
  generateObjectId();
});

const progressAdd = ref(false);
const listImg = ref([
  {
    stt: 1,
    src: null,
    content: "Anime",
  },
  {
    stt: 1,
    src: null,
    content: "Action",
  },
  {
    stt: 1,
    src: null,
    content: "",
  },
  {
    stt: 1,
    src: null,
    content: "",
  },
  {
    stt: 1,
    src: null,
    content: "",
  },
  {
    stt: 1,
    src: null,
    content: "",
  },
  {
    stt: 1,
    src: null,
    content: "",
  },
  {
    stt: 1,
    src: null,
    content: "",
  },
  {
    stt: 1,
    src: null,
    content: "",
  },
  {
    stt: 1,
    src: null,
    content: "",
  },
  {
    stt: 1,
    src: null,
    content: "",
  },
  {
    stt: 1,
    src: null,
    content: "",
  },
  {
    stt: 1,
    src: null,
    content: "",
  },
  {
    stt: 1,
    src: null,
    content: "",
  },
  {
    stt: 1,
    src: null,
    content: "",
  },
]);

const textareaValue = ref("Một cái gì đó");

//👉 Get first data  -->
const getSubject = async () => {
  try {
    const res = await request.get("http://192.168.1.7:1234/api/v1/promts/list");
    console.log(res.data.data, "sdajdfsjhkjkasd");
    if (res.data.status === true) {

      dataSubject.value = res.data.data;

      showForm.value = 0;
    }
  } catch (error) {
    console.log(error);
  }
};

const selectedItem = ref("");
const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectItem = (item, index) => {
  selectedItem.value = item;
  showForm.value = index;
  isDropdownOpen.value = false;
};

//👉 Genarate chat  -->
const postChat = async () => {
  const data = JSON.stringify(saveForm.value);
  await request
    .post("http://192.168.1.7:1234/api/v1/create/story", {
      content: data,
      id_project: generateObjectId(),
      id_subject: showForm.value+1
    })
    .then((res) => {})
    .catch((err) => console.log(err));
};
</script>

<template>
  <VAlert color="success" type="success" v-if="successStatus">
    Success ^^
  </VAlert>

  <VAlert type="error" v-if="errorStatus">
    An error occurred, please try again.... <strong>{{ lido }}</strong>
  </VAlert>
  <!-- <div class="selectnorm">
      <select class="" v-model="testVal" @change="handleChange">
    <option v-for="(item34, index) in dataSubject" :key="index" :value="index">
      {{ item34.name }}
    </option>
    <VIcon style="z-index: 999999;" icon="bx-file-find" />
  </select>
 
  </div> -->

  <section>
    <VRow>
      <VCol cols="4" sm="4" v-model="panel">
        <!-- <a @click="showForm = 0">Cau chuyen</a>
        <a @click="showForm = 1">Khoa học</a> -->
        <!-- <div   v-for="(item2, index2) in test"
          :key="index2">
          
          <VSelect
                    :items="item2.name"
                    :label="
                     item2.name
                    "
                    v-model="item2.name"
                  />
         </div>
        -->
        <div class="selectnorm">
          <div class="selected-item" @click="toggleDropdown">
            <span>{{ selectedItem.name || "Select" }}</span>
            <VIcon icon="bx-exit-fullscreen" />
          </div>
          <ul class="dropdown-list" v-if="isDropdownOpen">
            <li
              v-for="(item, index) in dataSubject"
              :key="index"
              @click="selectItem(item, index)"
            >
              <span>{{ item.name }}</span>
            </li>
          </ul>
        </div>
        <template>
          <v-select
            :item-props="itemProps"
            :items="items"
            label="User"
          ></v-select>
        </template>

        {{ dataSubject.name }}
        <VExpansionPanels
          v-model="panel"
          v-for="(item, index) in dataSubject"
          :key="index"
        >
          <!-- SECTION Delivery Address -->
          <VExpansionPanel
            v-if="index == showForm && saveForm.length == item.data.length"
          >
            <VExpansionPanelTitle> {{ item.name }}</VExpansionPanelTitle>
            <VExpansionPanelText
              v-for="(item1, index1) in item.data"
              :key="index1"
            >
              <VRow v-if="item1.html === 'select'">
                <VCol cols="12" sm="12">
                  <VSelect
                    :items="item1.content.split(',').map((item) => item.trim())"
                    :label="
                      item1.title.split(',').map((item) => item.trim())[0]
                    "
                    v-model="saveForm[index1].option"
                  />
                </VCol>
              </VRow>
              <VRow v-if="item1.html === 'input'">
                <VCol cols="12" sm="12">
                  <VTextField
                    v-model="saveForm[index1].option"
                    :label="item1.title"
                  />
                </VCol>
              </VRow>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
        <VRow style="margin-top: 18px">
          <VCol cols="12">
            <VTextarea
              readonly
              rows="2"
              label="Readonly"
              v-model="textareaValue"
            />
          </VCol>
        </VRow>
        <Vrow>
          <VCol
            cols="12"
            sm="12"
            style="align-items: center; display: flex; justify-content: center"
          >
            <VBtn @click="postChat" variant="flat"> Gen Chat </VBtn>
          </VCol>
        </Vrow>
      </VCol>
      <!-- <VProgressLinear indeterminate color="primary" v-if="progressStop" /> -->
      <VCol cols="6" sm="6" style="height: 780px">
        <div class="scrollable-wrapper">
          <VRow style="margin: 0 !important"
            ><VCol
              cols="6"
              sm="6"
              v-for="(item, index) in listImg"
              :key="index"
            >
              <a-image
                v-if="item.src"
                :width="200"
                src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
              />
              <div v-else class="empty-img">
                <VBtn class="btn-genImage" variant="tonal"> Generate </VBtn>
                <a-image
                  src="https://www.antdv.com/#error"
                  fallback="data:image/png;base64,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"
                />
              </div>
            </VCol>
          </VRow>
        </div>
      </VCol>
      <!-- <VProgressLinear indeterminate color="primary" v-if="progressStop" /> -->
      <VCol cols="2" sm="2">
        <div class="gen-all">
          <VBtn>
            Video & Âm thanh
            <VIcon end icon="bxs-videos" />
          </VBtn>
          <VBtn style="margin-top: 24px">
            Chỉ video
            <VIcon end icon="bx-volume-mute" />
          </VBtn>
        </div>
      </VCol>
      <!-- <VProgressLinear indeterminate color="primary" v-if="progressStop" /> -->
    </VRow>
  </section>
</template>

<style lang="scss">
.scrollable-wrapper {
  width: 100%; /* Độ rộng của khung cuộn */
  height: 100%; /* Độ cao của khung cuộn */
  overflow-y: auto; /* Kích hoạt thanh cuộn dọc khi nội dung vượt quá kích thước */
  padding: 10px; /* Khoảng cách bên trong của khung */
  box-sizing: border-box; /* Đảm bảo padding được tính vào kích thước */
}
// .selectnorm {
//  width: 100%;
//  height: auto;
//  position: relative;
//   }
// .selectnorm select{
//   width: 286px;
//     height: 45px;
//     background-color: #ffffff;
// box-shadow: 0px 3px 3px -2px rgba(50, 71, 92, 0.06),
//             0px 3px 4px 0px rgba(50, 71, 92, 0.04),
//             0px 1px 8px 0px rgba(50, 71, 92, 0.04);
//     outline: none;
//     border-radius: 6px;
//     margin: 12px 0;
//     padding: 12px;
// }
.selectnorm {
  position: relative;
  width: 100%;
}
.selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px;
  background-color: #ffffff;
  box-shadow: 0px 3px 3px -2px rgba(50, 71, 92, 0.06),
    0px 3px 4px 0px rgba(50, 71, 92, 0.04),
    0px 1px 8px 0px rgba(50, 71, 92, 0.04);
  border-radius: 6px;
  cursor: pointer;
  margin: 12px 0;
  width: 100%;
}
.selected-item span {
  margin-right: 10px;
  color: #546677;
}
.dropdown-list {
  // position: absolute;

  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 6px 6px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0;
  margin-bottom: 12px;
}
.dropdown-list li {
  padding: 10px;
  cursor: pointer;
}
.dropdown-list span {
  color: #32475cde;
}
.dropdown-list li:hover {
  background-color: #f0f0f0;
}
.app-user-search-filter {
  inline-size: 385px;
}

.text-capitalize {
  text-transform: capitalize;
}
//image genarate
.ant-image {
  width: 100%;
}

.empty-img {
  position: relative;
  width: 100%;
  // height: auto;
  /* border: 1px solid; */
  border-radius: 6px;
  display: flex;
  background: #ffffff;
  box-shadow: 0px 3px 3px -2px rgba(50, 71, 92, 0.06),
    0px 3px 4px 0px rgba(50, 71, 92, 0.04),
    0px 1px 8px 0px rgba(50, 71, 92, 0.04);
  justify-content: center;
}
.btn-genImage {
  position: absolute;
  /* width: 100px; */
  /* height: 100px; */
  top: 76%;
  // left: 30%;
  z-index: 99;
  margin: 0 auto;
}
.gen-all {
  position: relative;
  top: 50%;
  width: 100%;
  gap: 18px;
}

.v-col-sm-6 {
  display: flex;
  justify-content: center;
}

.v-field__input {
  width: auto !important;
}

.v-chip.v-chip--size-small {
  font-size: 8.875px !important;
}

.user-list-name:not(:hover) {
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
}

//
.b1-title {
  margin-bottom: 24px;
}
.v-progress-circular {
  width: 20px;
  margin-left: 8px;
}
//
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
.v-progress-linear {
  width: 80%;
}
</style>
