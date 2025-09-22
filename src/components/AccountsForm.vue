<template>
  <section class="accounts-form">
    <header class="header">
      <h2>Учётные записи</h2>
      <button class="add-btn" @click="store.addEmpty" type="button" title="Добавить учётную запись">+</button>
    </header>

    <p class="hint">
      Подсказка: для нескольких меток используйте «;». Полное редактирование добавим на следующих шагах.
    </p>

    <div v-if="store.accounts.length === 0" class="empty">
      Список пуст. Нажмите «+», чтобы добавить запись.
    </div>

    <ul v-else class="list">
      <li v-for="a in store.accounts" :key="a.id" class="item">
        <span class="mono">{{ a.id }}</span>
        <span>type: <b>{{ a.type }}</b></span>
        <button class="remove-btn" @click="store.remove(a.id)" type="button" title="Удалить">🗑</button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAccountsStore } from '@/stores/accounts';

const store = useAccountsStore();

onMounted(() => {
  store.hydrate();
});
</script>

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
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}
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
.item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #555; }
.remove-btn {
  border: 1px solid #f1c4c4;
  background: #fff5f5;
  color: #a33;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
}
.remove-btn:hover { background: #ffe9e9; }
</style>
