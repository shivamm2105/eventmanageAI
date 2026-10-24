import { describe, it, expect } from 'vitest';
import {
  toMinorUnits,
  fromMinorUnits,
  calculateBudgetSummary,
  formatCurrency,
  getRecommendedCategoryAllocations,
} from '../shared/src/budgetEngine';
import { BudgetItem } from '../shared/src/types';

describe('Budget Planning Engine', () => {
  const sampleItems: BudgetItem[] = [
    {
      id: '1',
      category: 'Venue',
      estimatedAmount: 50000,
      actualAmount: 48000,
    },
    {
      id: '2',
      category: 'Catering',
      estimatedAmount: 60000,
      actualAmount: 65000,
    },
    {
      id: '3',
      category: 'Decor',
      estimatedAmount: 20000,
      actualAmount: 0, // Not confirmed yet, should use estimated
    },
  ];

  describe('Minor units conversions', () => {
    it('correctly converts decimals to minor integer units without floating point distortion', () => {
      expect(toMinorUnits(10.55)).toBe(1055);
      expect(toMinorUnits(0.1 + 0.2)).toBe(30);
      expect(fromMinorUnits(1055)).toBe(10.55);
    });

    it('handles negative, zero, and NaN inputs safely', () => {
      expect(toMinorUnits(0)).toBe(0);
      expect(toMinorUnits(NaN)).toBe(0);
      expect(toMinorUnits(-50)).toBe(-5000);
    });
  });

  describe('calculateBudgetSummary', () => {

    it('accurately computes estimated, actual, and committed totals', () => {
      const summary = calculateBudgetSummary(150000, sampleItems, 10);

      // Estimated total: 50000 + 60000 + 20000 = 130000
      expect(summary.totalEstimated).toBe(130000);

      // Actual total entered: 48000 + 65000 = 113000
      expect(summary.totalActual).toBe(113000);

      // Effective committed: 48000 (actual) + 65000 (actual) + 20000 (estimated) = 133000
      // Remaining: 150000 - 133000 = 17000
      expect(summary.remainingBudget).toBe(17000);
      expect(summary.isOverBudget).toBe(false);
      expect(summary.overspendAmount).toBe(0);
    });

    it('flags overspending and calculates overspend amount correctly', () => {
      const overbudgetSummary = calculateBudgetSummary(100000, sampleItems, 10);

      // Committed is 133000, budget is 100000 -> overspend by 33000
      expect(overbudgetSummary.isOverBudget).toBe(true);
      expect(overbudgetSummary.remainingBudget).toBe(-33000);
      expect(overbudgetSummary.overspendAmount).toBe(33000);
    });

    it('calculates contingency reserve correctly based on percentage', () => {
      const summary = calculateBudgetSummary(200000, [], 15);
      expect(summary.contingencyPercent).toBe(15);
      expect(summary.contingencyAmount).toBe(30000);
    });
  });

  describe('formatCurrency', () => {
    it('formats INR correctly with rupee symbol', () => {
      const formatted = formatCurrency(150000, 'INR');
      expect(formatted).toContain('1,50,000');
    });

    it('formats USD correctly', () => {
      const formatted = formatCurrency(5000, 'USD');
      expect(formatted).toContain('5,000');
    });
  });

  describe('getRecommendedCategoryAllocations', () => {
    it('returns wedding allocations summing to approximately 100%', () => {
      const allocations = getRecommendedCategoryAllocations('wedding', 500000);
      const totalPct = allocations.reduce((sum, item) => sum + item.percentage, 0);
      expect(totalPct).toBe(100);

      const totalEstimated = allocations.reduce((sum, item) => sum + item.estimatedAmount, 0);
      expect(totalEstimated).toBe(500000);
    });

    it('returns 100% allocations for engagement, baby shower, and corporate gala', () => {
      for (const type of ['engagement', 'baby_shower', 'corporate_gala', 'community', 'birthday']) {
        const allocs = getRecommendedCategoryAllocations(type, 100000);
        const sumPct = allocs.reduce((sum, item) => sum + item.percentage, 0);
        expect(sumPct).toBe(100);
      }
    });

    it('falls back safely to default allocations when celebration type is unknown', () => {
      const fallback = getRecommendedCategoryAllocations('unknown_carnival_fest', 200000);
      expect(fallback.length).toBeGreaterThan(0);
      const totalPct = fallback.reduce((sum, item) => sum + item.percentage, 0);
      expect(totalPct).toBe(100);
    });

    it('handles zero total budget gracefully without division-by-zero errors', () => {
      const zeroSummary = calculateBudgetSummary(0, sampleItems, 10);
      expect(zeroSummary.totalBudget).toBe(0);
      expect(zeroSummary.remainingBudget).toBe(-133000);
      expect(zeroSummary.isOverBudget).toBe(true);
      expect(zeroSummary.utilizationPercent).toBe(0);
    });

    it('correctly aggregates custom expense items in calculations', () => {
      const itemsWithCustom: BudgetItem[] = [
        ...sampleItems,
        {
          id: 'custom-1',
          category: 'Vintage Fireworks Permit',
          estimatedAmount: 25000,
          actualAmount: 22000,
          isCustom: true,
        },
      ];
      const summary = calculateBudgetSummary(200000, itemsWithCustom, 10);
      expect(summary.totalEstimated).toBe(155000); // 130000 + 25000
      expect(summary.totalActual).toBe(135000); // 113000 + 22000
    });
  });
});
