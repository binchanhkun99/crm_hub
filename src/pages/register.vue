<script setup>
import { VForm } from "vuetify/components/VForm";

import { useGenerateImageVariant } from "@/@core/composable/useGenerateImageVariant";
import AuthProvider from "@/views/pages/authentication/AuthProvider.vue";
import girlWithLaptopDark from "@images/illustrations/girl-with-laptop-dark.png";
import girlWithLaptopLight from "@images/illustrations/girl-with-laptop-light.png";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
import {
  alphaDashValidator,
  emailValidator,
  requiredValidator,
} from "@validators";
import { useRouter } from 'vue-router';

import store from "@/store";

const girlWithLaptop = useGenerateImageVariant(
  girlWithLaptopLight,
  girlWithLaptopDark
);
const refVForm = ref();
const username = ref("");
const email = ref("");
const password = ref("");
const privacyPolicies = ref(true);
const loading = ref()
const successStatus = ref(false)
const errorStatus = ref(false)
// Router
// const route = useRoute();
const router = useRouter();

const lido = ref("")

// Form Errors
const errors = ref({
  email: undefined,
  password: undefined,
  email: undefined
});
const loggedIn = computed(() => store.getters.usersss)
console.log("____HJJHHJHHJ?______", loggedIn.value)
if (loggedIn.value) {
  router.push("/");
}

const register = () => {
  const user = {
    email: email.value.trim(),
    username: username.value.trim(),
    password: password.value.trim(),
  };
  loading.value = true;
  store
    .dispatch("register", user)
    .then(() => {
        successStatus.value= true
        router.push("/");
    })
    .catch((error) => {
      loading.value = false;
      errorStatus.value = true
  
      setTimeout(()=>{
        errorStatus.value = false
      }, 3000)
    //   const { errors: formErrors } = error.response.data;


      console.log("errr");
    });
};
const isPasswordVisible = ref(false);

const onSubmit = () => {
 refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) register()
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
  <VAlert color="success" type="success" v-if="successStatus">
    Success ^^
  </VAlert>

  <VAlert type="error" v-if="errorStatus">
    An error occurred, please try again.... <strong>{{ lido }}</strong>
  </VAlert>
  <VRow no-gutters class="auth-wrapper">
    <!-- <VCol lg="8" class="d-none d-lg-flex">
    
      <div class="position-relative w-100 pa-8">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="700"
            :src="girlWithLaptop"
            class="auth-illustration"
          />
        </div>
      </div>
    </VCol> -->

    <VCol
      cols="12"
      lg="12"
      class="d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface))"
    >
      <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-6">
        <VCardItem class="justify-start">
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
          <h6 class="text-h6 mb-1">Adventure starts here 🚀</h6>
          <p class="mb-0">Make your app management easy and fun!</p>
        </VCardText>

        <VCardText>
          <VForm ref="refVForm" @submit.prevent="onSubmit">
            <VRow>
              <!-- Username -->
              <VCol cols="12">
                <VTextField
                  v-model="username"
                  autofocus
                  :rules="[requiredValidator, alphaDashValidator]"
                  label="Username"
                />
              </VCol>

              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Email"
                  type="email"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="password"
                  :rules="[requiredValidator]"
                  label="Password"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center mt-2 mb-4">
                  <VCheckbox
                    id="privacy-policy"
                    v-model="privacyPolicies"
                    :rules="[requiredValidator]"
                    inline
                  >
                    <template #label>
                      <span class="mx-2 text-wrap">
                        I agree to
                        <a href="javascript:void(0)" class="text-primary"
                          >privacy policy & terms</a
                        >
                      </span>
                    </template>
                  </VCheckbox>
                </div>

                <VBtn block type="submit"> Sign up </VBtn>
              </VCol>

              <!-- create account -->
              <VCol
                cols="12"
                class="d-flex justify-center flex-column flex-sm-row flex-md-column flex-lg-row text-center text-base"
              >
                <span>Already have an account?</span>
                <RouterLink class="text-primary ms-2" :to="{ name: 'login' }">
                  Sign in instead
                </RouterLink>
              </VCol>

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
    </VCol>
  </VRow>
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
