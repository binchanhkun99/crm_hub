<script setup>
import request from "@/utils/request";
import { onMounted, ref } from "vue";
const currentTab = ref(0);

const loadingData = ref(false);
const loadingAsk = ref(false);
// 👉 Fetching all ticket
const allTicketDataNew = ref();
const clearMessage = () => {
  message.value = "";
};

const apiKey = ref();
const page = ref(0);
const rowPerPage = ref(10);
const searchQuery = ref("");
const idEmp = ref();
var datalc = JSON.parse(localStorage.getItem("user")) || {};
apiKey.value = datalc.key;
idEmp.value = datalc.id;
const fullTicket = ref();
const getTicketAll = async () => {
  loadingData.value = true;

  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&page=${page.value}&limit=${rowPerPage.value}&search=${searchQuery.value}&action=cskh_list_all`
    )
    .then((res) => {
      loadingData.value = false;
      fullTicket.value = res.data.data.reverse();
    })
    .catch((err) => {
      console.log(err);
      loadingData.value = false;
    });
};
const open = ref();
const closeTkID = ref();
const closeTicket = (id) => {
  open.value = true;
  closeTkID.value = id;
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
const handleOk = async () => {
  try {
    const deleteUsr = await request.post(
      `api/admin/index.php?key=${apiKey.value}&action=update_status_cskh`,
      {
        ticket_id: tkId.value,
        new_status: 4,
      }
    );
    if (deleteUsr.data.data == 1) {
      getbyNhanVien();
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
const getAllTicket = async () => {
  loadingData.value = true;

  await request
    .get(
      `api/admin/index.php?key=${apiKey.value}&page=${page.value}&limit=${rowPerPage.value}&search=${searchQuery.value}&action=cskh_list_by_status&status=1`
    )
    .then((res) => {
      loadingData.value = false;
      allTicketDataNew.value = res.data.data.reverse();
    })
    .catch((err) => {
      console.log(err);
      loadingData.value = false;
    });
};
const UserName = ref();
// 👉 Get ticket by id
const message = ref();
const detailTicketData = ref();
const tkId = ref();
const idPart2 = ref();
const getTicketByID = async (id, us) => {
  clearMessage();
  detailTicketData.value = [];
  UserName.value = us;
  tkId.value = id;
  loadingAsk.value = true;
  loadingData.value = true;
  await request
    .get(
      `api/web/index.php?key=${apiKey.value}&action=user_list_messages&ticket=${id}`
    )
    .then((res) => {
      detailTicketData.value = res.data.data;
      autoScroll();
      loadingAsk.value = false;
      loadingData.value = false;
    })
    .catch((errr) => {
      loadingAsk.value = false;
      loadingData.value = false;
    });
};

const sendMessage = async () => {
  loadingData.value = true;
  try {
    const res = await request.post(
      `api/admin/index.php?key=${apiKey.value}&action=cskh_update_employee_id`,
      {
        employee_id: idEmp.value,
        id: tkId.value,
      }
    );
    if (res.data.data == 1) {
      const res1 = await request.post(
        `api/web/index.php?key=${apiKey.value}&action=user_create_message`,
        {
          ticket: tkId.value,
          message: message.value,
          role: "admin",
        }
      );
      if (res1.data.data == 1) {
        console.log(res);
        loadingData.value = false;
        getAllTicket();
      }
    } else {
      alert("Đã xảy ra lỗi");
    }
  } catch (error) {
    console.log(error);
    loadingData.value = false;
  }
};
//Update ticket by nhân viên

watch(currentTab, (newVal, oldVal) => {
  if (newVal == "two") {
    detailTicketData.value = null;
    getbyNhanVien();
  }
  if (newVal == "one") {
    detailTicketData.value = null;
    getAllTicket();
  }
  if (newVal == "three") {
    detailTicketData.value = null;
    getTicketAll();
  }
});
const reachedBottom = ref(false); // Biến để xác định khi cuộn đến dưới cùng
const testDOM = ref(null);
watch(
  testDOM,
  async (newVal, oldVal) => {
    const idITV = setInterval(() => {
      let container = document.querySelector(".supprt-scroll");
      // Cuộn xuống dưới cùng khi nội dung được hiển thị
      container.scrollTop = container.scrollHeight;
      // Nếu đã đến dưới cùng, dừng interval
      if (reachedBottom.value) {
        clearInterval(idITV);
        console.log("Dừng interval");
        return;
      }

      // Kiểm tra xem đã cuộn đến dưới cùng chưa
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight
      ) {
        reachedBottom.value = true;
      }

      console.log("Vẫn chạy");
    }, 500);
  },
  { deep: true }
);

const dataByNhanVien = ref([]);
const getbyNhanVien = async () => {
  loadingData.value = true;
  await request
    .post(
      `api/web/index.php?key=${apiKey.value}&action=cskh_list_employee_id_tickets`,
      {
        employee_id: idEmp.value,
      }
    )
    .then((res) => {
      dataByNhanVien.value = res.data.data;
      loadingData.value = false;
    })
    .catch((err) => {
      loadingData.value = false;
      console.log(err);
    });
};
const sendMessageByNhanVien = async () => {
  loadingData.value = true;
  const res1 = await request.post(
    `api/web/index.php?key=${apiKey.value}&action=user_create_message`,
    {
      ticket: tkId.value,
      message: message.value,
      role: "admin",
    }
  );
  if (res1.data.data == 1) {
    loadingData.value = false;
    getbyNhanVien();
    getTicketByID(tkId.value, UserName.value);
    autoScroll();
  }
};
const role = ref(0);
onMounted(() => {
  const dataRole = JSON.parse(localStorage.getItem("user")) || {};
  role.value = dataRole.level;
  getAllTicket();
  // autoScroll()
});

const autoScroll = () => {
  const idITV = setInterval(() => {
    let container = document.querySelector(".supprt-scroll");
    // Cuộn xuống dưới cùng khi nội dung được hiển thị
    container.scrollTop = container.scrollHeight;
    // Nếu đã đến dưới cùng, dừng interval
    if (reachedBottom.value) {
      clearInterval(idITV);
      console.log("Dừng interval");
      return;
    }

    // Kiểm tra xem đã cuộn đến dưới cùng chưa
    if (
      container.scrollTop + 1 + container.clientHeight >=
      container.scrollHeight
    ) {
      reachedBottom.value = true;
    }
  }, 500);
};
</script>
<template>
  <section v-if="role == 0 || role == 1">
    <div>
      <a-modal v-model:open="open" title="Đóng Ticket" @ok="handleOk">
        <p>Bạn có chắc đóng Ticket này?</p>
      </a-modal>
    </div>
    <VTabs v-model="currentTab" class="v-tabs-pill">
      <VTab style="width: 125px" value="one">Tickets Open</VTab>
      <VTab style="width: 120px" value="two">My Ticket</VTab>
      <VTab style="width: 125px" value="three">Tất cả Ticket</VTab>
    </VTabs>

    <VWindow v-model="currentTab" class="mt-5">
      <VWindowItem value="one">
        <VRow>
          <VCol cols="3" sm="3" style="height: 638px; overflow: auto">
            <VAlert
              type="info"
              style="cursor: pointer; margin-bottom: 6px"
              v-for="(item, index) in allTicketDataNew"
              :key="index"
              @click="getTicketByID(item.id, item.user_TK)"
            >
              <strong>{{ item.title }}</strong>
            </VAlert>
          </VCol>
          <VCol cols="9" sm="9">
            <div v-if="!detailTicketData">
              <a-result
                status="403"
                title="Open Ticket"
                sub-title="Hãy mở bất kỳ ticket nào có sẵn để bắt đầu hỗ trợ khách hàng"
              ></a-result>
            </div>

            <div v-if="detailTicketData" class="supprt">
              <h3>Xác nhận ticket</h3>
              <a-skeleton v-if="loadingAsk" active />

              <a-card
                :title="item.role == 'admin' ? 'Admin' : UserName"
                :bordered="false"
                v-for="(item, index) of detailTicketData"
                :key="index"
              >
                <p>{{ item.message }}</p>
              </a-card>
              <div
                style="
                  width: 100%;
                  display: flex;
                  height: auto;
                  gap: 8px;
                  align-items: center;
                "
              >
                <VTextField
                  v-model="message"
                  clearable
                  type="text"
                  label="Message"
                  color="primary"
                  clear-icon="bx-x-circle"
                  append-icon=""
                  @click:clear="clearMessage"
                >
                </VTextField>

                <VBtn
                  style="width: 40px"
                  color="success"
                  @click="sendMessage()"
                >
                  <VIcon icon="bx-check" />
                </VBtn>
              </div></div
          ></VCol>
        </VRow>
      </VWindowItem>

      <!-- Tab thứ 2 -->
      <VWindowItem value="two">
        <VRow>
          <VCol cols="3" sm="3" style="height: 638px; overflow: auto">
            <VAlert
              color="secondary"
              icon="bxl-whatsapp"
              style="cursor: pointer; margin-bottom: 6px"
              v-for="(item, index) in dataByNhanVien"
              :key="index"
              @click="getTicketByID(item.cskh_id, item.taikhoan_user)"
            >
              <strong>{{ item.cskh_title }}</strong>
            </VAlert>
          </VCol>
          <VCol cols="9" sm="9">
            <div v-if="!detailTicketData">
              <a-result
                status="403"
                title="Open Ticket"
                sub-title="Hãy mở bất kỳ ticket nào có sẵn để bắt đầu hỗ trợ khách hàng"
              >
              </a-result>
            </div>
            <VBtn @click="closeTicket()" v-if="detailTicketData">
              Đóng
              <VIcon end icon="bx-check-circle" />
            </VBtn>
            <div v-if="detailTicketData" ref="testDOM" class="supprt-scroll">
              <h3>Trả lời ticket</h3>
              <!-- <a-skeleton v-if="loadingAsk" active /> -->

              <a-card
                :title="item.role == 'admin' ? 'Admin' : UserName"
                :bordered="false"
                v-for="(item, index) of detailTicketData"
                :key="index"
              >
                <p>{{ item.message }}</p>
              </a-card>
              <div
                style="
                  width: 100%;
                  display: flex;
                  height: auto;
                  gap: 8px;
                  align-items: center;
                "
              >
                <VTextField
                  v-model="message"
                  clearable
                  type="text"
                  label="Message"
                  color="primary"
                  clear-icon="bx-x-circle"
                  append-icon=""
                  @click:clear="clearMessage"
                >
                </VTextField>

                <VBtn
                  style="width: 40px"
                  color="success"
                  @click="sendMessageByNhanVien()"
                >
                  <VIcon icon="bx-send" />
                </VBtn>
              </div></div
          ></VCol>
        </VRow>
      </VWindowItem>
      <!-- Tab thứ 3 -->
      <VWindowItem value="three">
        <VRow>
          <VCol cols="3" sm="3" style="height: 638px; overflow: auto">
            <VAlert
              type="success"
              style="cursor: pointer; margin-bottom: 6px"
              v-for="(item, index) in fullTicket"
              :key="index"
              @click="getTicketByID(item.id, item.user_TK)"
            >
              <strong>{{ item.title }}</strong>
            </VAlert>
          </VCol>
          <VCol cols="9" sm="9">
            <div v-if="!detailTicketData">
              <a-result
                status="403"
                title="Open Ticket"
                sub-title="Hãy mở bất kỳ ticket nào có sẵn để bắt đầu hỗ trợ khách hàng"
              >
              </a-result>
            </div>

            <div v-if="detailTicketData" ref="testDOM" class="supprt-scroll">
              <h3>Trả lời ticket</h3>
              <!-- <a-skeleton v-if="loadingAsk" active /> -->

              <a-card
                :title="item.role == 'admin' ? 'Admin' : UserName"
                :bordered="false"
                v-for="(item, index) of detailTicketData"
                :key="index"
              >
                <p>{{ item.message }}</p>
              </a-card>
              <div
                style="
                  width: 100%;
                  display: flex;
                  height: auto;
                  gap: 8px;
                  align-items: center;
                "
              >
                <VTextField
                  v-model="message"
                  clearable
                  type="text"
                  label="Message"
                  color="primary"
                  clear-icon="bx-x-circle"
                  append-icon=""
                  @click:clear="clearMessage"
                >
                </VTextField>

                <VBtn
                  style="width: 40px"
                  color="success"
                  @click="sendMessageByNhanVien()"
                >
                  <VIcon icon="bx-send" />
                </VBtn>
              </div></div
          ></VCol>
        </VRow>
      </VWindowItem>
    </VWindow>

    <!-- Dialog loading data edit-->
    <VDialog v-model="loadingData" width="300">
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
  </section>
  <section v-else>
    <a-result
      status="500"
      title="401"
      sub-title="Bạn không có quyền truy cập trang này!"
    >
      <template #extra> </template>
    </a-result>
  </section>
</template>
<style lang="scss">
#app
  > div
  > div
  > div
  > div
  > div.layout-content-wrapper
  > main
  > div
  > section
  > div.v-window.v-theme--light.mt-5
  > div
  > div.v-window-item.v-window-item--active
  > div
  > div.v-col-sm-9.v-col-9
  > div
  > div.v-input.v-input--horizontal.v-input--density-default.v-text-field
  > div.v-input__append {
  font-size: 15px;
  background: #e4e4e6;
  color: green;
  width: 50px;
  border-radius: 12px;
  display: flex;
  font-weight: 700;
  justify-content: center;
  cursor: pointer;
}
.list {
  width: 100%;
  height: 100%;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  .box {
    width: 100%;
    background-color: rgb(128, 128, 235);
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    text-align: center;
    cursor: pointer;
    .icon {
      width: 20%;
    }
    .content {
      width: 80%;
      white-space: nowrap; /* Ngăn văn bản xuống dòng */

      .text {
        -webkit-line-clamp: 1;
        display: -webkit-box;
        // -webkit-box-orient: vertical;
        line-height: 40px;
        overflow: hidden;
        margin: 0;
        color: #ffffff;
      }
    }
  }
  .box:hover {
    background-color: rgb(105, 108, 255);
  }
}

.active-link {
  background-color: rgb(105, 108, 255);
}
.supprt-scroll {
  width: 100%;
  height: 600px;
  overflow: auto;
  border: 1px solid;
  border-radius: 8px;
  padding: 8px;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scroll-behavior: smooth; /* Kích hoạt cuộn mượt */
}
.supprt {
  width: 100%;
  height: 600px;
  overflow: auto;
  border: 1px solid;
  border-radius: 8px;
  padding: 8px;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
