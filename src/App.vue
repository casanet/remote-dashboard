<template>
  <div id="app">
    <!-- Place here the notification container -->
    <vue-snotify></vue-snotify>
    <!-- Route here the app -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app"
};
</script>

<style>
/* Import the notification them */
@import "~vue-snotify/styles/simple.css";
</style>
