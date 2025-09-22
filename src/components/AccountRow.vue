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
  <li class="item" :class="{ 'no-password': typeValue !== 'LOCAL' }">
    <!-- Метки -->
    <div class="field">
      <input
        :id="'labels-' + account.id"
        v-model="labelsInput"
        type="text"
        maxlength="300"
        placeholder="Введите метку"
        aria-label="Метки"
        @blur="onBlurLabels"
      />
    </div>

    <!-- Логин -->
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

    <!-- Тип -->
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

    <!-- Пароль (только для LOCAL) -->
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

    <!-- Удаление -->
    <div class="actions">
      <button
        class="icon-btn icon-btn--danger"
        type="button"
        title="Удалить"
        aria-label="Удалить"
        @click="$emit('remove')"
      >
        <span aria-hidden="true">🗑</span>
      </button>
    </div>
  </li>
</template>

<style scoped>
.item {
  display: grid;
  grid-template-columns: 1.2fr 1fr 220px minmax(180px, 1fr) 44px;
  gap: 12px 12px;
  align-items: start;         
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #fff;
}

.item.no-password {
  grid-template-columns: 1.2fr 1fr 220px 0 44px;
}

.field {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
}

.field > input,
.field > select {
  width: 100%;
  height: 36px;               
}


.help {
  margin-top: 2px;
  line-height: 1.25;
}


.actions {
  grid-column: 5;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  justify-self: end;
  align-self: start;          
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: #fff;
  cursor: pointer;
}
.icon-btn:hover { background: var(--surface); }
.icon-btn--danger {
  border-color: color-mix(in srgb, var(--danger) 30%, #fff);
  background: color-mix(in srgb, var(--danger) 8%, #fff);
  color: #a11;
}
.icon-btn--danger:hover {
  background: color-mix(in srgb, var(--danger) 14%, #fff);
  border-color: color-mix(in srgb, var(--danger) 45%, #fff);
}

</style>
