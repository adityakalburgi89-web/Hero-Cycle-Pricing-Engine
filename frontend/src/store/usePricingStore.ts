import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../config/api.js';
import { PricingRule, CreatePricingRuleInput } from '../types/pricing.types.js';

interface PricingState {
  rules: PricingRule[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  
  fetchRules: () => Promise<void>;
  addRule: (rule: CreatePricingRuleInput) => Promise<boolean>;
  updateRule: (id: string, rule: Partial<CreatePricingRuleInput>) => Promise<boolean>;
  deleteRule: (id: string) => Promise<boolean>;
  clearStatus: () => void;
}

export const usePricingStore = create<PricingState>()(
  devtools(
    (set) => ({
      rules: [],
      isLoading: false,
      error: null,
      successMessage: null,

      clearStatus: () => set({ error: null, successMessage: null }),

      fetchRules: async () => {
        set({ isLoading: true, error: null });
        try {
          const response: any = await api.get('/pricing-rules');
          set({ rules: response.data || [], isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      addRule: async (newRule) => {
        set({ isLoading: true, error: null, successMessage: null });
        try {
          const response: any = await api.post('/pricing-rules', newRule);
          set((state) => ({
            rules: [response.data, ...state.rules],
            isLoading: false,
            successMessage: 'Pricing rule created successfully!',
          }));
          return true;
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      updateRule: async (id, updatedFields) => {
        set({ isLoading: true, error: null, successMessage: null });
        try {
          const response: any = await api.patch(`/pricing-rules/${id}`, updatedFields);
          set((state) => ({
            rules: state.rules.map((rule) => (rule.id === id ? response.data : rule)),
            isLoading: false,
            successMessage: 'Pricing rule updated successfully!',
          }));
          return true;
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      deleteRule: async (id) => {
        set({ isLoading: true, error: null, successMessage: null });
        try {
          await api.delete(`/pricing-rules/${id}`);
          set((state) => ({
            rules: state.rules.filter((rule) => rule.id !== id),
            isLoading: false,
            successMessage: 'Pricing rule deleted successfully!',
          }));
          return true;
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },
    }),
    { name: 'PricingStore' }
  )
);
