<script setup>
import store from "@/store";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
import { requiredValidator } from "@validators";
import { useRouter } from "vue-router";
import { VForm } from "vuetify/components/VForm";
const router = useRouter();

const form = ref({
  email: "",
  password: "",
  remember: false,
});
const loading = ref(false);
const successStatus = ref(false);
const errorStatus = ref(false);
const isPasswordVisible = ref(false);
const loadingEdit = ref(false);
//Vuex
const loggedIn = computed(() => store.getters.usersss);
if (loggedIn.value) {
  router.push("/");
}

const handleLogin = () => {
  loadingEdit.value = true;
  const user = {
    email: form.value.email,
    password: form.value.password,
  };
  store
    .dispatch("login", user)
    .then((res) => {
      loadingEdit.value = false;
      successStatus.value = true;
      router.push("/");
      if (res == "error") {pushNotiError();}
      else{
        pushNotiSuccess()
      }
    })
    .catch((error) => {
      loadingEdit.value = false;
      console.log(error);

      errorStatus.value = true;
    });
};
const refVForm = ref();
const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) handleLogin();
    else {
      errorStatus.value = true;
      lido.value = "Invalid field";
      setTimeout(() => {
        errorStatus.value = false;
      }, 3000);
    }
  });
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
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative">
      <!-- 👉 Top shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1TopShape })"
        class="text-primary auth-v1-top-shape d-none d-sm-block"
      />

      <!-- 👉 Bottom shape -->
      <VNodeRenderer
        :nodes="h('div', { innerHTML: authV1BottomShape })"
        class="auth-v1-bottom-shape d-none d-sm-block text-primary"
      />

      <VCard class="auth-card px-2" max-width="450">
        <VCardItem class="justify-center">
          <template #prepend>
            <div class="d-flex">
              <VNodeRenderer :nodes="themeConfig.app.logo" />
            </div>
          </template>

          <VCardTitle class="auth-title">
            {{ themeConfig.app.title }}
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <h6 class="text-h6 mb-1">
            Chào mừng bạn đến với {{ themeConfig.app.title }}! 👋🏻
          </h6>
          <p class="mb-0">Vui lòng đăng nhập để sử dụng CRM</p>
        </VCardText>

        <VCardText>
          <VForm ref="refVForm" @submit.prevent="onSubmit">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="form.email"
                  autofocus
                  label="Email hoặc tên người dùng"
                  :rules="[requiredValidator]"
                  type="text"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="form.password"
                  label="Mật khẩu"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :rules="[requiredValidator]"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <!-- remember me checkbox -->
                <div
                  class="d-flex align-center justify-space-between flex-wrap mt-2 mb-4"
                >
                  <!-- <VCheckbox v-model="form.remember" label="Remember me" /> -->

                  <!-- <RouterLink
                    class="text-primary text-sm ms-2"
                    :to="{ name: 'pages-authentication-forgot-password-v1' }"
                  >
                    Forgot Password?
                  </RouterLink> -->
                </div>

                <!-- login button -->
                <VBtn block type="submit"> Đăng nhập </VBtn>
              </VCol>

              <!-- create account -->
              <!-- <VCol
                cols="12"
                class="text-center text-base d-flex justify-center flex-wrap"
              >
                <span>New on our platform?</span>
                <RouterLink
                  class="text-primary ms-2"
                  :to="{ name: 'pages-authentication-register-v1' }"
                >
                  Create an account
                </RouterLink>
              </VCol> -->

              <!-- auth providers -->
              <VCol cols="12" class="text-center">
                <!-- <AuthProvider /> -->
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
  <!-- Dialog loading data edit-->
  <VDialog v-model="loadingEdit" width="300">
    <VCard color="primary" width="300">
      <VCardText class="pt-3">
        Đang đăng nhập ...
        <VProgressLinear indeterminate class="mb-0" />
      </VCardText>
    </VCard>
  </VDialog>
  <!-- Error-->
  <VDialog v-model="notiError" width="300">
    <VCard color="primary" width="300">
      <VAlert type="error">
        <strong>Đã có lỗi xẩy ra vui lòng thử lại</strong>
      </VAlert>
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

</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
  redirectIfLoggedIn: true
</route>
