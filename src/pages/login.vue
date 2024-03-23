<script setup>
import store from "@/store";
import AuthProvider from "@/views/pages/authentication/AuthProvider.vue";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
import {
  requiredValidator
} from "@validators";
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

//Vuex
const loggedIn = computed(() => store.getters.usersss);
if (loggedIn.value) {
  router.push("/");
}

const handleLogin = () => {
  const user = {
    email: form.value.email,
    password: form.value.password,
  };
  loading.value = true;
  store
    .dispatch("login", user)
    .then(() => {
      loading.value = false;
      successStatus.value = true;
      router.push("/");
    })
    .catch((error) => {
      console.log(error)
      loading.value = false;
      errorStatus.value = true;

      setTimeout(() => {
        errorStatus.value = false;
      }, 3000);
      console.log("errr");
    });
};
const refVForm = ref();
const onSubmit = () => {
 refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) handleLogin()
    else{
        errorStatus.value = true
        lido.value = "Invalid field"
      setTimeout(()=>{
        errorStatus.value = false
      }, 3000)}
  });
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
            Welcome to {{ themeConfig.app.title }}! 👋🏻
          </h6>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>

        <VCardText>
          <VForm ref="refVForm" @submit.prevent="onSubmit">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="form.email"
                  autofocus
                  label="Email or Username"

                  :rules="[requiredValidator]"
                  type="text"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="form.password"
                  label="Password"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :rules="[requiredValidator]"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <!-- remember me checkbox -->
                <div
                  class="d-flex align-center justify-space-between flex-wrap mt-2 mb-4"
                >
                  <VCheckbox v-model="form.remember" label="Remember me" />

                  <!-- <RouterLink
                    class="text-primary text-sm ms-2"
                    :to="{ name: 'pages-authentication-forgot-password-v1' }"
                  >
                    Forgot Password?
                  </RouterLink> -->
                </div>

                <!-- login button -->
                <VBtn block type="submit"> Login </VBtn>
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

              <VCol cols="12" class="d-flex align-center">
                <VDivider />
                <span class="mx-4">or</span>
                <VDivider />
              </VCol>

              <!-- auth providers -->
              <VCol cols="12" class="text-center">
                <AuthProvider />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
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
