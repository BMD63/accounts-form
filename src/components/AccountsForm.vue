<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAccountsStore } from '@/stores/accounts';
import AccountRow from '@/components/AccountRow.vue';

const store = useAccountsStore();

const hasInvalid = computed(() =>
  store.accounts.some(a => {
    const login = (a.login ?? '').trim();
    const loginInvalid = login.length === 0 || login.length > 100;
    const pwdInvalid =
      a.type === 'LOCAL' ? !(a.password && a.password.length > 0 && a.password.length <= 100) : false;
    return loginInvalid || pwdInvalid;
  })
);

function onAdd() {
  if (hasInvalid.value) return; 
  store.addEmpty();
}

onMounted(() => {
  store.hydrate();
});
</script>

<template>
  <section class="accounts-form">
    <header class="header">
      <h2>Учётные записи</h2>
      <button
        class="add-btn"
        :disabled="hasInvalid"
        @click="onAdd"
        type="button"
        title="Добавить учётную запись"
        aria-label="Добавить учётную запись"
      >
        <span class="add-btn__icon" aria-hidden="true">+</span>
      </button>
    </header>

    <p class="hint">
      Подсказка: для нескольких меток используйте «;».
    </p>

    <div v-if="store.accounts.length === 0" class="empty">
      Список пуст. Нажмите «+», чтобы добавить запись.
    </div>

    <div v-else class="cols-header">
      <span>Метки</span>
      <span>Логин</span>
      <span>Тип записи</span>
      <span>Пароль</span>
      <span></span> 
    </div>

    <ul v-if="store.accounts.length" class="list">
      <AccountRow
        v-for="a in store.accounts"
        :key="a.id"
        :account="a"
        @remove="store.remove(a.id)"
      />
    </ul>
  </section>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.add-btn {
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}
.add-btn__icon { font-size: 22px; line-height: 1; color: #111; }
.add-btn:hover { background: #f6f6f6; }
.hint { color: #666; margin: 0 0 8px; }
.empty { opacity: 0.7; margin: 8px 0 16px; }

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.cols-header {
  display: grid;
  grid-template-columns: 1.2fr 1fr 220px minmax(180px, 1fr) 44px;
  gap: 12px;
  align-items: center;
  padding: 6px 10px 8px;
  color: var(--muted);
  font-size: 12px;
}
.add-btn[disabled] {
  opacity: .5;
  cursor: not-allowed;
}
</style>
