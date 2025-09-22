import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Account } from '../types/account';

function genId(): string {
  return 'acc_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([]);

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
    accounts.value = accounts.value.filter(a => a.id !== id);
  }

  return {
    accounts,
    addEmpty,
    remove,
  };
});
