<script setup>
import ProfileSigninHead from './ProfileSigninHead.vue'
import {reactive} from "vue";
import axios from "axios";

const formData = reactive({
  username: "",
  password: "",
});

const register = () => {
  console.log('Отправка данных:', formData);
  axios.post('http://localhost:8080/auth/signin', formData)
};

</script>


<template>
  <div class="fixed top-0 left-0  h-full w-full bg-black z-10 opacity-70"></div>
  <div class="bg-white w-96 h-full fixed right-0 top-0 z-20 p-8">
    <ProfileSigninHead/>


    <div class="flex flex-col gap-4 mt-7">

      <form @submit.prevent="register">
        <div>
          <label for="Username">Имя</label>
          <input type="text" name="username" placeholder="Имя пользователя"
                 v-model="formData.username" required>
        </div>

        <div>
          <label for="password">Пароль</label>
          <input type="password" placeholder="Пароль" v-model="formData.password" required/>
        </div>
        <span
          class="text-purple-600 hover:text-purple-800 cursor-pointer"
          @click="handleClick"
          @keydown.enter="handleClick"
          tabindex="0"
          role="button"
        >
    Кликабельный текст
      </span>
        <button
          type="submit"
          class="mt-4 transition bg-lime-500 w-full rounded-xl py-3 text-white disabled:bg-slate-300 hover:bg-lime-600 active:bg-lime-700 cursor-pointer">
          Войти
        </button>


      </form>

    </div>


  </div>
</template>
