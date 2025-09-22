<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Account } from '@/types/account';
import { useAccountsStore } from '@/stores/accounts';

const props = defineProps<{ account: Account }>();
defineEmits<{ (e: 'remove'): void }>();

const store = useAccountsStore();

const login = ref(props.account.login);
const loginError = ref(false);

watch(() => props.account.login, (v) => { login.value = v; });

function onBlurLogin() {
  const value = login.value.trim();
  const invalid = value.length === 0 || value.length > 100;
  loginError.value = invalid;
  if (invalid) return;
  store.updatePartial(props.account.id, { login: value });
}
</script>

<template>
  <li class="item">
    <!-- Логин -->
    <div class="field">
      <label class="lbl" for="login-{{ account.id }}">Логин</label>
      <input
        :id="'login-' + account.id"
        v-model="login"
        type="text"
        maxlength="100"
        placeholder="Введите логин"
        :class="{ 'is-error': loginError }"
        @blur="onBlurLogin"
      />
      <small v-if="loginError" class="help" style="color:#a11;">Обязательное поле (1–100 символов)</small>
    </div>

    <div class="type">
      type: <b>{{ account.type }}</b>
    </div>

    <!-- Удаление -->
    <button class="btn btn--danger" type="button" title="Удалить" @click="$emit('remove')">🗑</button>
  </li>
</template>

<style scoped>
.item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: end;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #fff;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.lbl { font-size: 12px; color: var(--muted); }
.type { align-self: center; }
</style>
