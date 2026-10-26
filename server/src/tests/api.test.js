'use strict';
/**
 * API integration tests.
 * Calculator tests do not require a database.
 * Tests that hit DB-dependent routes are skipped here.
 */
const request = require('supertest');
const app     = require('../app');

describe('Health Check', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBe('1.0.0');
  });
});

describe('404 Handling', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route');
    expect(res.status).toBe(404);
  });
});

describe('Authentication middleware', () => {
  it('rejects requests to protected routes without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects requests to admin routes without token', async () => {
    const res = await request(app).get('/api/v1/admin/analytics');
    expect(res.status).toBe(401);
  });

  it('rejects malformed Bearer tokens', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('rejects non-Bearer auth schemes', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Basic dXNlcjpwYXNz');
    expect(res.status).toBe(401);
  });
});

describe('Calculator validation', () => {
  it('EMI: missing annualRate and tenure returns 400', async () => {
    const res = await request(app).post('/api/v1/calculators/emi').send({ principal: 100000 });
    expect(res.status).toBe(400);
  });

  it('Compound interest: empty body returns 400', async () => {
    const res = await request(app).post('/api/v1/calculators/compound-interest').send({});
    expect(res.status).toBe(400);
  });

  it('Inflation: negative years returns 400', async () => {
    const res = await request(app).post('/api/v1/calculators/inflation').send({ amount: 100000, inflationRate: 6, years: -5 });
    expect(res.status).toBe(400);
  });

  it('Investment returns: missing required fields returns 400', async () => {
    const res = await request(app).post('/api/v1/calculators/investment-returns').send({ initialInvestment: 100000 });
    expect(res.status).toBe(400);
  });
});

describe('Calculator happy paths (no DB needed)', () => {
  it('EMI with valid inputs returns emi, schedule, disclaimer', async () => {
    const res = await request(app).post('/api/v1/calculators/emi')
      .send({ principal: 200000, annualRate: 10, tenureMonths: 24 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('emi');
    expect(res.body).toHaveProperty('schedule');
    expect(res.body).toHaveProperty('disclaimer');
    expect(res.body.schedule).toHaveLength(24);
  });

  it('Compound interest with valid inputs returns finalValue and dataPoints', async () => {
    const res = await request(app).post('/api/v1/calculators/compound-interest')
      .send({ principal: 50000, annualRate: 10, years: 5 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('finalValue');
    expect(res.body).toHaveProperty('dataPoints');
    expect(res.body.finalValue).toBeGreaterThan(50000);
  });

  it('Inflation with valid inputs returns futureEquivalent', async () => {
    const res = await request(app).post('/api/v1/calculators/inflation')
      .send({ amount: 50000, inflationRate: 5, years: 5 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('futureEquivalent');
    expect(res.body.futureEquivalent).toBeGreaterThan(50000);
  });

  it('Investment returns with valid inputs returns grossFinalValue', async () => {
    const res = await request(app).post('/api/v1/calculators/investment-returns')
      .send({ initialInvestment: 100000, monthlyContribution: 1000, annualReturn: 12, years: 10 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('grossFinalValue');
    expect(res.body).toHaveProperty('feeDrag');
  });
});

describe('Public routes do not require authentication', () => {
  it('GET /api/v1/worlds does not return 401 (may 500 if DB offline)', async () => {
    // We only verify it doesn't reject with 401/403
    const res = await request(app).get('/api/v1/worlds');
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it('GET /api/v1/leaderboard does not return 401', async () => {
    const res = await request(app).get('/api/v1/leaderboard');
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
