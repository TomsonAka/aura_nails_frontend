<script setup>
import ProfileHead from './ProfileHead.vue'
import {reactive} from "vue";
import axios from "axios";

const formData = reactive({
  email: "",
  username: "",
  password: "",
});

const register = () => {
  console.log('Отправка данных:', formData);
  axios.post('http://localhost:8080/auth/signup', formData)
};

</script>


<template>
  <div class="fixed top-0 left-0  h-full w-full bg-black z-10 opacity-70"></div>
    <div class="bg-white w-96 h-full fixed right-0 top-0 z-20 p-8">
    <ProfileHead/>


    <div class="flex flex-col gap-4 mt-7">

      <form @submit.prevent="register">
        <div class="grid grid-cols-1 gap-2 ">
          <label class="Username">Имя</label>
          <input type="text" name="username" placeholder="Имя пользователя"
                 v-model="formData.username" required>
        </div>

        <div class="grid grid-cols-1 gap-2">
          <label for="email">Email</label>
          <input type="email" placeholder="Email" v-model="formData.email" required/>
        </div>

        <div class="grid grid-cols-1 gap-2">
          <label for="password">Пароль</label>
          <input type="password" placeholder="Пароль" v-model="formData.password" required/>
        </div>
        <button
          type="submit"
          class="mt-4 transition bg-lime-500 w-full rounded-xl py-3 text-white disabled:bg-slate-300 hover:bg-lime-600 active:bg-lime-700 cursor-pointer">
          Зарегистрироваться
        </button>


      </form>

    </div>


  </div>
</template>
