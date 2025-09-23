<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import type { Account } from '@/types/account';
import { useAccountsStore } from '@/stores/accounts';
import { parseLabels, labelsToString } from '@/composables/useLabels';

const props = defineProps<{
  account: Account;
  focusId?: string | null;
  validateId?: string | null;   
  validateTick?: number;        
}>();
defineEmits<{ (e: 'remove'): void }>();

const store = useAccountsStore();

const showPwd = ref(false);
const pwdInputType = computed(() => (showPwd.value ? 'text' : 'password'));
function togglePwd() {
  showPwd.value = !showPwd.value;
}

const loginHelpId = `login-help-${props.account.id}`;
const passwordHelpId = `pwd-help-${props.account.id}`;

const loginEl = ref<HTMLInputElement | null>(null); 
function focusLogin() {
  requestAnimationFrame(() => loginEl.value?.focus());
}

onMounted(() => {
  if (props.focusId === props.account.id) focusLogin();
});

watch(() => props.focusId, (v) => {
  if (v === props.account.id) focusLogin();
});

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
function validateAllRequiredNow() {
  // логин обязателен всегда
  const lv = login.value.trim();
  loginError.value = lv.length === 0 || lv.length > 100;
  // пароль обязателен только при LOCAL
  if (typeValue.value === 'LOCAL') {
    const pv = password.value;
    passwordError.value = pv.length === 0 || pv.length > 100;
  } else {
    passwordError.value = false;
  }
}

watch(
  () => props.validateTick,
  () => {
    if (props.validateId === props.account.id) {
      validateAllRequiredNow();  
    }
  }
);
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
          ref="loginEl"
          :id="'login-' + account.id"
          v-model="login"
          type="text"
          maxlength="100"
          placeholder="Введите логин"
          aria-label="Логин"
          :class="{ 'is-error': loginError }"
          @blur="onBlurLogin"
        />
        <small v-if="loginError" class="help" :id="loginHelpId" style="color:#a11;">Обязательное поле (1–100 символов)</small>
      </div>

      <div class="field" v-if="typeValue === 'LOCAL'">
        <div class="input-wrap">
          <input
            :id="'pwd-' + account.id"
            v-model="password"
            :type="pwdInputType"
            maxlength="100"
            placeholder="Введите пароль"
            aria-label="Пароль"
            :class="{ 'is-error': passwordError }"
            :aria-invalid="passwordError ? 'true' : 'false'"
            :aria-describedby="passwordError ? passwordHelpId : undefined"
            @blur="onBlurPassword"
          />
          <button
            class="eye-btn"
            type="button"
            :title="showPwd ? 'Скрыть пароль' : 'Показать пароль'"
            :aria-label="showPwd ? 'Скрыть пароль' : 'Показать пароль'"
            :aria-pressed="showPwd ? 'true' : 'false'"
            @click="togglePwd"
          >
            <svg v-if="!showPwd" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M12 5c5.5 0 9.5 4.1 10.7 6-.9 1.3-4.7 6-10.7 6S2.5 12.3 1.3 11C2.5 9.1 6.5 5 12 5Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="12" cy="11" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M3 3l18 18" stroke="currentColor" stroke-width="1.5"/>
              <path d="M12 5c5.5 0 9.5 4.1 10.7 6-.6.9-2.6 3.3-5.7 4.9M6.9 7.1C4.1 8.6 2.5 10.6 1.3 11 2.5 12.9 6.5 17 12 17c1 0 2-.1 2.9-.3" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="12" cy="11" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
        </div>

  <small v-if="passwordError" class="help" :id="passwordHelpId" style="color:#a11;">
    Обязательное поле (1–100 символов)
  </small>
</div>

      <div class="actions">
        <button
          class="trash-btn"
          type="button"
          title="Удалить"
          aria-label="Удалить"
          @click="$emit('remove')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M3 6h18" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 6V4.8c0-.44.36-.8.8-.8h6.4c.44 0 .8.36.8.8V6" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <rect x="5" y="6" width="14" height="14" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 10v6M14 10v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
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
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
    color: #777;        
    opacity: .85;
    line-height: 1;
  }
  .trash-btn:hover { 
    opacity: 1; 
    color: #a11; 
  }                 
  .trash-btn:focus-visible { 
    outline: 2px solid color-mix(in srgb, var(--brand) 50%, transparent); 
    border-radius: 6px; 
  }
  .input-wrap {
    position: relative;
    min-width: 0;
    }
  .input-wrap > input {
    padding-right: 36px; 
  }

  .eye-btn {
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
    color: #777;       
    opacity: .85;
  }
  .eye-btn:hover { opacity: 1; color: #555; }
  .eye-btn:focus-visible { outline: 2px solid color-mix(in srgb, var(--brand) 50%, transparent); border-radius: 6px; }
</style>
