'use strict';
const request = require('supertest');
const app     = require('../app');

describe('Calculator API', () => {

  /* ---- EMI ---- */
  describe('POST /api/v1/calculators/emi', () => {
    it('calculates correct EMI for standard loan', async () => {
      const res = await request(app).post('/api/v1/calculators/emi')
        .send({ principal: 100000, annualRate: 12, tenureMonths: 12 });
      expect(res.status).toBe(200);
      expect(res.body.emi).toBeCloseTo(8884.88, 0);
      expect(res.body.totalInterest).toBeGreaterThan(0);
      expect(res.body.schedule).toHaveLength(12);
    });

    it('handles near-zero interest correctly', async () => {
      const res = await request(app).post('/api/v1/calculators/emi')
        .send({ principal: 12000, annualRate: 0.01, tenureMonths: 12 });
      expect(res.status).toBe(200);
      expect(res.body.emi).toBeCloseTo(1000, 0);
    });

    it('rejects negative principal', async () => {
      const res = await request(app).post('/api/v1/calculators/emi')
        .send({ principal: -1000, annualRate: 12, tenureMonths: 12 });
      expect(res.status).toBe(400);
    });

    it('rejects zero tenure', async () => {
      const res = await request(app).post('/api/v1/calculators/emi')
        .send({ principal: 100000, annualRate: 12, tenureMonths: 0 });
      expect(res.status).toBe(400);
    });

    it('rejects unrealistic interest rate', async () => {
      const res = await request(app).post('/api/v1/calculators/emi')
        .send({ principal: 100000, annualRate: 200, tenureMonths: 12 });
      expect(res.status).toBe(400);
    });

    it('total payment = emi × tenure', async () => {
      const res = await request(app).post('/api/v1/calculators/emi')
        .send({ principal: 500000, annualRate: 9, tenureMonths: 60 });
      expect(res.status).toBe(200);
      expect(res.body.totalPayment).toBeCloseTo(res.body.emi * 60, 0);
    });
  });

  /* ---- Compound Interest ---- */
  describe('POST /api/v1/calculators/compound-interest', () => {
    it('computes compound growth correctly', async () => {
      const res = await request(app).post('/api/v1/calculators/compound-interest')
        .send({ principal: 100000, annualRate: 12, years: 10, monthlyContribution: 0, inflationRate: 0 });
      expect(res.status).toBe(200);
      // 100000 * (1 + 0.12/12)^120 ≈ 330038
      expect(res.body.finalValue).toBeGreaterThan(330000);
      expect(res.body.finalValue).toBeLessThan(331000);
    });

    it('allows zero principal with monthly contributions', async () => {
      const res = await request(app).post('/api/v1/calculators/compound-interest')
        .send({ principal: 0, annualRate: 12, years: 10, monthlyContribution: 1000, inflationRate: 0 });
      expect(res.status).toBe(200);
      expect(res.body.finalValue).toBeGreaterThan(230000);
    });

    it('inflation-adjusted value is lower than nominal', async () => {
      const res = await request(app).post('/api/v1/calculators/compound-interest')
        .send({ principal: 100000, annualRate: 12, years: 10, monthlyContribution: 0, inflationRate: 6 });
      expect(res.status).toBe(200);
      expect(res.body.inflationAdjustedValue).toBeLessThan(res.body.finalValue);
    });

    it('returns correct number of yearly data points', async () => {
      const res = await request(app).post('/api/v1/calculators/compound-interest')
        .send({ principal: 10000, annualRate: 10, years: 5, monthlyContribution: 500 });
      expect(res.status).toBe(200);
      expect(res.body.dataPoints).toHaveLength(5);
    });

    it('growth = finalValue - totalContributions', async () => {
      const res = await request(app).post('/api/v1/calculators/compound-interest')
        .send({ principal: 50000, annualRate: 8, years: 5, monthlyContribution: 2000 });
      expect(res.status).toBe(200);
      expect(res.body.totalGrowth).toBeCloseTo(res.body.finalValue - res.body.totalContributions, 0);
    });
  });

  /* ---- Inflation ---- */
  describe('POST /api/v1/calculators/inflation', () => {
    it('calculates future equivalent correctly', async () => {
      const res = await request(app).post('/api/v1/calculators/inflation')
        .send({ amount: 100000, inflationRate: 7, years: 10 });
      expect(res.status).toBe(200);
      // 100000 * 1.07^10 ≈ 196715
      expect(res.body.futureEquivalent).toBeGreaterThan(196000);
      expect(res.body.futureEquivalent).toBeLessThan(197500);
    });

    it('purchasing power is less than original amount', async () => {
      const res = await request(app).post('/api/v1/calculators/inflation')
        .send({ amount: 100000, inflationRate: 6, years: 10 });
      expect(res.status).toBe(200);
      expect(res.body.purchasingPower).toBeLessThan(100000);
    });

    it('rejects negative amount', async () => {
      const res = await request(app).post('/api/v1/calculators/inflation')
        .send({ amount: -100, inflationRate: 6, years: 10 });
      expect(res.status).toBe(400);
    });

    it('rejects negative years', async () => {
      const res = await request(app).post('/api/v1/calculators/inflation')
        .send({ amount: 100000, inflationRate: 6, years: -5 });
      expect(res.status).toBe(400);
    });
  });

  /* ---- Investment Returns ---- */
  describe('POST /api/v1/calculators/investment-returns', () => {
    it('shows fee drag correctly', async () => {
      const res = await request(app).post('/api/v1/calculators/investment-returns')
        .send({ initialInvestment: 100000, monthlyContribution: 0, annualReturn: 12, years: 20, annualFee: 1.5 });
      expect(res.status).toBe(200);
      expect(res.body.feeDrag).toBeGreaterThan(0);
      expect(res.body.netFinalValue).toBeLessThan(res.body.grossFinalValue);
    });

    it('returns 20 yearly data points for 20-year calculation', async () => {
      const res = await request(app).post('/api/v1/calculators/investment-returns')
        .send({ initialInvestment: 50000, monthlyContribution: 2000, annualReturn: 10, years: 20 });
      expect(res.status).toBe(200);
      expect(res.body.dataPoints).toHaveLength(20);
    });

    it('zero fee drag when annualFee is 0', async () => {
      const res = await request(app).post('/api/v1/calculators/investment-returns')
        .send({ initialInvestment: 100000, monthlyContribution: 0, annualReturn: 10, years: 10, annualFee: 0 });
      expect(res.status).toBe(200);
      expect(res.body.feeDrag).toBeCloseTo(0, 0);
    });
  });
});
