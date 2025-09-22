<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Account } from '@/types/account';
import { useAccountsStore } from '@/stores/accounts';

const props = defineProps<{ account: Account }>();
defineEmits<{ (e: 'remove'): void }>();

const store = useAccountsStore();

const login = ref(props.account.login);
const loginError = ref(false);

const typeValue = ref<Account['type']>(props.account.type);

const password = ref(props.account.password ?? '');
const passwordError = ref(false);

watch(() => props.account.login, (v) => { login.value = v; });
watch(() => props.account.type,  (v) => { typeValue.value = v; });
watch(() => props.account.password, (v) => {
  password.value = (v ?? '');
});
watch(() => props.account.type, (v) => {
  typeValue.value = v;
  if (v === 'LOCAL' && props.account.password === null) {
    password.value = '';
  }
});
function onBlurLogin() {
  const value = login.value.trim();
  loginError.value = value.length === 0 || value.length > 100;
  if (loginError.value) return;
  store.updatePartial(props.account.id, { login: value });
}
function onBlurPassword() {
  if (typeValue.value !== 'LOCAL') return;
  const value = password.value;
  passwordError.value = value.length === 0 || value.length > 100;
  if (passwordError.value) return;

  store.updatePartial(props.account.id, { password: value });
}

function onChangeType() {
  store.setType(props.account.id, typeValue.value);
}
</script>

<template>
  <li class="item" :class="{ 'no-password': typeValue !== 'LOCAL' }">
    <!-- Логин -->
    <div class="field">
      <label class="lbl" :for="'login-' + account.id">Логин</label>
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

    <div class="field">
      <label class="lbl" :for="'type-' + account.id">Тип записи</label>
      <select
        :id="'type-' + account.id"
        v-model="typeValue"
        @change="onChangeType"
      >
        <option value="LOCAL">Локальная</option>
        <option value="LDAP">LDAP</option>
      </select>
    </div>

    <div class="field" v-if="typeValue === 'LOCAL'">
      <label class="lbl" :for="'pwd-' + account.id">Пароль</label>
      <input
        :id="'pwd-' + account.id"
        v-model="password"
        type="password"
        maxlength="100"
        placeholder="Введите пароль"
        :class="{ 'is-error': passwordError }"
        @blur="onBlurPassword"
      />
      <small v-if="passwordError" class="help" style="color:#a11;">
        Обязательное поле (1–100 символов)
      </small>
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
  grid-template-columns: 1fr 220px minmax(180px, 1fr) 44px;
  gap: 12px;
  align-items: end;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #fff;
}

.item.no-password {
  grid-template-columns: 1fr 220px 0 44px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lbl {
  font-size: 12px;
  color: var(--muted);
}

.field > input,
.field > select {
  width: 100%;
}

.actions {
  grid-column: 4;         
  display: flex;
  align-items: center;
  justify-content: flex-end;
  justify-self: end;
  align-self: end;
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
