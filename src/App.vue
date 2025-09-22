<script setup lang="ts">
import AccountsForm from '@/components/AccountsForm.vue';
</script>

<template>
  <div style="max-width: 980px; margin: 24px auto; padding: 16px;">
    <AccountsForm />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
