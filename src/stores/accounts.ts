import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Account } from '@/types/account';

const LS_KEY = 'accounts:v1';

function genId(): string {
  return 'acc_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function isAccount(x: any): x is Account {
  return x
    && typeof x.id === 'string'
    && Array.isArray(x.labels)
    && (x.type === 'LDAP' || x.type === 'LOCAL')
    && typeof x.login === 'string'
    && (typeof x.password === 'string' || x.password === null);
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([]);
  const inited = ref(false);

  function hydrate() {
    if (inited.value) return;
    inited.value = true;

    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          accounts.value = parsed.filter(isAccount);
        }
      }
    } catch {
    }

    // автосохранение при любых изменениях
    watch(
      accounts,
      (val) => {
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(val));
        } catch {
        }
      },
      { deep: true, immediate: true },
    );
  }

  function addEmpty() {
    const acc: Account = {
      id: genId(),
      labels: [],
      type: 'LOCAL',
      login: '',
      password: '',
    };
    accounts.value.push(acc);
  }

  function remove(id: string) {
    accounts.value = accounts.value.filter((a) => a.id !== id);
  }

  return {
    accounts,
    hydrate,
    addEmpty,
    remove,
  };
});
