<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAccountsStore } from '@/stores/accounts';
import AccountRow from '@/components/AccountRow.vue';

const store = useAccountsStore();

onMounted(() => {
  store.hydrate();
});

const showPasswordCol = computed(() =>
  store.accounts.some(a => a.type === 'LOCAL')
);

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
      <div class="cols-left">
        <span>Метки</span>
        <span>Тип записи</span>
      </div>

      <div class="cols-right" :class="{ single: !showPasswordCol }">
        <span>Логин</span>
        <span v-if="showPasswordCol">Пароль</span>
        <span class="actions-spacer"></span>
      </div>
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
.add-btn__icon { 
  font-size: 22px; 
  line-height: 1; 
  color: #111; }
.add-btn:hover { 
  background: #f6f6f6; 
}
.hint { 
  color: #666; 
  margin: 0 0 8px; 
}
.empty { 
  opacity: 0.7; 
  margin: 8px 0 16px; 
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.cols-header {
  display: grid;
  grid-template-columns: auto 1fr; 
  gap: 12px;
  align-items: center;
  padding: 6px 10px 8px;
  color: var(--muted);
  font-size: 12px;
}

.cols-left {
  display: grid;
  grid-template-columns: var(--col-label) var(--col-type);
  gap: 12px;
}

.cols-right {
  display: grid;
  grid-template-columns: 1fr 1fr var(--col-action);
  gap: 12px;
}
.cols-right.single {
  grid-template-columns: 1fr var(--col-action);
}

.cols-left > span, .cols-right > span { min-width: 0; }
.actions-spacer { width: var(--col-action); }
</style>
