<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Account } from '@/types/account';
import { useAccountsStore } from '@/stores/accounts';
import { parseLabels, labelsToString } from '@/composables/useLabels';

const props = defineProps<{ account: Account }>();
defineEmits<{ (e: 'remove'): void }>();

const store = useAccountsStore();

/* --- Метки --- */
const labelsInput = ref(labelsToString(props.account.labels));
watch(() => props.account.labels, (v) => {
  labelsInput.value = labelsToString(v);
});
function onBlurLabels() {
  const parsed = parseLabels(labelsInput.value);
  store.updatePartial(props.account.id, { labels: parsed });
}

/* --- Логин --- */
const login = ref(props.account.login);
const loginError = ref(false);
watch(() => props.account.login, (v) => { login.value = v; });

/* --- Тип --- */
const typeValue = ref<Account['type']>(props.account.type);
watch(() => props.account.type,  (v) => { typeValue.value = v; });

/* --- Пароль --- */
const password = ref(props.account.password ?? '');
const passwordError = ref(false);
watch(() => props.account.password, (v) => { password.value = (v ?? ''); });
watch(() => props.account.type, (v) => {
  typeValue.value = v;
  if (v === 'LOCAL' && props.account.password === null) password.value = '';
});

/* --- Handlers --- */
function onBlurLogin() {
  const value = login.value.trim();
  loginError.value = value.length === 0 || value.length > 100;
  if (!loginError.value) store.updatePartial(props.account.id, { login: value });
}
function onBlurPassword() {
  if (typeValue.value !== 'LOCAL') return;
  const value = password.value;
  passwordError.value = value.length === 0 || value.length > 100;
  if (!passwordError.value) store.updatePartial(props.account.id, { password: value });
}
function onChangeType() {
  store.setType(props.account.id, typeValue.value);
}
</script>

<template>
  <li class="row">
    <div class="left">
      <div class="field">
        <input
          :id="'labels-' + account.id"
          v-model="labelsInput"
          type="text"
          maxlength="300"
          placeholder="Введите метку или несколько"
          aria-label="Метки"
          @blur="onBlurLabels"
        />
      </div>

      <div class="field">
        <select
          :id="'type-' + account.id"
          v-model="typeValue"
          aria-label="Тип записи"
          @change="onChangeType"
        >
          <option value="LOCAL">Локальная</option>
          <option value="LDAP">LDAP</option>
        </select>
      </div>
    </div>

    <div class="right" :class="{ single: typeValue !== 'LOCAL' }">
      <div class="field">
        <input
          :id="'login-' + account.id"
          v-model="login"
          type="text"
          maxlength="100"
          placeholder="Введите логин"
          aria-label="Логин"
          :class="{ 'is-error': loginError }"
          @blur="onBlurLogin"
        />
        <small v-if="loginError" class="help" style="color:#a11;">Обязательное поле (1–100 символов)</small>
      </div>

      <div class="field" v-if="typeValue === 'LOCAL'">
        <input
          :id="'pwd-' + account.id"
          v-model="password"
          type="password"
          maxlength="100"
          placeholder="Введите пароль"
          aria-label="Пароль"
          :class="{ 'is-error': passwordError }"
          @blur="onBlurPassword"
        />
        <small v-if="passwordError" class="help" style="color:#a11;">Обязательное поле (1–100 символов)</small>
      </div>

      <div class="actions">
        <button
          class="trash-btn"
          type="button"
          title="Удалить"
          aria-label="Удалить"
          @click="$emit('remove')"
        >
          🗑
        </button>
      </div>
    </div>
  </li>
</template>

<style scoped>
  .row {
    display: grid;
    grid-template-columns: auto 1fr; 
    gap: 12px;
    align-items: start;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: #fff;
  }

  .left {
    display: grid;
    grid-template-columns: var(--col-label) var(--col-type);
    gap: 12px;
  }

  .right {
    display: grid;
    grid-template-columns: 1fr 1fr var(--col-action);
    gap: 12px;
    min-width: 0;
  }
  .right.single {
    grid-template-columns: 1fr var(--col-action);
  }

  /* Поля */
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0; 
  }
  .field > input, .field > select {
    width: 100%;
    height: 36px;
    min-width: 0;
  }
  .help { margin-top: 2px; line-height: 1.25; }

  .actions {
    display: flex;
    align-items: start;
    justify-content: flex-end;
  }
  .trash-btn {
    width: 36px; height: 36px;
    display: inline-flex; align-items: center; justify-content: center;
    background: none; border: none; padding: 0;
    font-size: 18px; line-height: 1; cursor: pointer; color: #a11;
  }
  .trash-btn:hover { transform: translateY(0.5px); }
</style>
