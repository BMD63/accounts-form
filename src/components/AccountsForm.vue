<script setup lang="ts">
  import { onMounted, computed, ref } from 'vue';
  import { useAccountsStore } from '@/stores/accounts';
  import AccountRow from '@/components/AccountRow.vue';

  const store = useAccountsStore();

  onMounted(() => {
    store.hydrate();
  });

  const showPasswordCol = computed(() =>
    store.accounts.some(a => a.type === 'LOCAL')
  );

  const focusId = ref<string | null>(null);

  const warnText = ref('');
  const warnVisible = ref(false);
  let warnTimer: number | undefined;

  function showWarn(text: string, ms = 2500) {
    warnText.value = text;
    warnVisible.value = true;
    if (warnTimer) window.clearTimeout(warnTimer);
    warnTimer = window.setTimeout(() => (warnVisible.value = false), ms);
  }

  const validateId = ref<string | null>(null);
  const validateTick = ref(0);

  function onAdd() {
    if (store.hasInvalid) {
    const bad = store.accounts.find(a => !store.isValid(a));
    validateId.value = bad?.id ?? null;
    validateTick.value++; 
    showWarn('Заполните текущую запись перед добавлением новой');
    return;
  }
  const id = store.addEmpty();
  focusId.value = id;
  }
  
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

    <p class="hint" role="note">
      <span class="hint-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <path d="M9.8 9a2.2 2.2 0 1 1 3.7 1.6c-.6.5-1 .8-1 .8-.5.4-.7.8-.7 1.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="12" cy="16.5" r="1" fill="currentColor"/>
        </svg>
      </span>
      Для указания нескольких меток одной пары логин/пароль используйте разделитель ;
    </p>

    <div
      class="toast"
      :class="{ 'toast--show': warnVisible }"
      role="status"
      aria-live="polite"
    >
      {{ warnText }}
    </div>

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
        :focus-id="focusId"
        :validate-id="validateId"
        :validate-tick="validateTick"
        @remove="store.remove(a.id)"
      />
    </ul>
  </section>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: flex-start; 
  gap: 10px;                    
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
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  margin: 0 0 8px;
}
.hint-icon {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--shadow-sm);
  color: #444;
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
.toast {
  position: relative;
  margin: 8px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--danger) 8%, #fff);
  border: 1px solid color-mix(in srgb, var(--danger) 35%, #fff);
  color: #a11;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity .18s ease, transform .18s ease;
  pointer-events: none;
  min-height: 0; 
}
.toast--show {
  opacity: 1;
  transform: translateY(0);
}
</style>
