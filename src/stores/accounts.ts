import { defineStore } from 'pinia';

export interface Account {
    id: string;
}

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    accounts: [] as Account[],
  }),
});