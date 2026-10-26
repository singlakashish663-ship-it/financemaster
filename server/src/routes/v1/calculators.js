const router = require('express').Router();
const { z }  = require('zod');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: 'Invalid input.', details: result.error.flatten().fieldErrors });
    req.validated = result.data;
    next();
  };
}

/* ---- EMI ---- */
const emiSchema = z.object({
  principal:     z.number().positive().max(100_000_000),
  annualRate:    z.number().positive().max(100),
  tenureMonths:  z.number().int().positive().max(360),
});

router.post('/emi', validate(emiSchema), (req, res) => {
  const { principal, annualRate, tenureMonths } = req.validated;
  const r   = annualRate / 100 / 12;
  const emi = r === 0
    ? principal / tenureMonths
    : (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);

  const totalPayment  = emi * tenureMonths;
  const totalInterest = totalPayment - principal;

  const schedule = [];
  let balance = principal;
  for (let month = 1; month <= tenureMonths; month++) {
    const interestPaid  = balance * r;
    const principalPaid = emi - interestPaid;
    balance = Math.max(0, balance - principalPaid);
    schedule.push({ month, emi: +emi.toFixed(2), principalPaid: +principalPaid.toFixed(2), interestPaid: +interestPaid.toFixed(2), balance: +balance.toFixed(2) });
  }

  res.json({
    emi: +emi.toFixed(2), totalPayment: +totalPayment.toFixed(2),
    totalInterest: +totalInterest.toFixed(2), principal, schedule,
    disclaimer: 'Hypothetical calculation. Actual EMI may differ based on lender terms.',
  });
});

/* ---- Compound Interest ---- */
const ciSchema = z.object({
  principal:            z.number().min(0).max(100_000_000),
  annualRate:           z.number().min(0).max(100),
  years:                z.number().positive().max(50),
  monthlyContribution:  z.number().min(0).max(1_000_000).optional(),
  inflationRate:        z.number().min(0).max(50).optional(),
});

router.post('/compound-interest', validate(ciSchema), (req, res) => {
  const { principal, annualRate, years, monthlyContribution = 0, inflationRate = 6 } = req.validated;
  const r              = annualRate / 100 / 12;
  const months         = Math.round(years * 12);
  const inflationMonthly = inflationRate / 100 / 12;

  const dataPoints = [];
  let value = principal, totalContributions = principal;
  for (let m = 1; m <= months; m++) {
    value = value * (1 + r) + monthlyContribution;
    totalContributions += monthlyContribution;
    if (m % 12 === 0) {
      const year = m / 12;
      dataPoints.push({
        year, value: +value.toFixed(2), contributions: +totalContributions.toFixed(2),
        growth: +(value - totalContributions).toFixed(2),
        inflationAdjusted: +(value / Math.pow(1 + inflationMonthly, m)).toFixed(2),
      });
    }
  }

  res.json({
    finalValue: +value.toFixed(2), totalContributions: +totalContributions.toFixed(2),
    totalGrowth: +(value - totalContributions).toFixed(2),
    growthPercent: +((value - totalContributions) / Math.max(totalContributions, 1) * 100).toFixed(2),
    inflationAdjustedValue: +(value / Math.pow(1 + inflationMonthly, months)).toFixed(2),
    dataPoints,
    disclaimer: 'Hypothetical illustration only. Returns are not guaranteed.',
  });
});

/* ---- Inflation ---- */
const inflationSchema = z.object({
  amount:         z.number().positive().max(100_000_000),
  inflationRate:  z.number().min(0).max(50),
  years:          z.number().positive().max(50),
});

router.post('/inflation', validate(inflationSchema), (req, res) => {
  const { amount, inflationRate, years } = req.validated;
  const futureEquivalent  = amount * Math.pow(1 + inflationRate / 100, years);
  const purchasingPower   = amount / Math.pow(1 + inflationRate / 100, years);

  const dataPoints = [];
  for (let y = 0; y <= years; y++) {
    dataPoints.push({
      year: y,
      futureEquivalent: +(amount * Math.pow(1 + inflationRate / 100, y)).toFixed(2),
      purchasingPower:  +(amount / Math.pow(1 + inflationRate / 100, y)).toFixed(2),
    });
  }

  res.json({
    originalAmount: amount,
    futureEquivalent: +futureEquivalent.toFixed(2),
    purchasingPower:  +purchasingPower.toFixed(2),
    purchasingPowerLoss: +(amount - purchasingPower).toFixed(2),
    purchasingPowerLossPercent: +((1 - purchasingPower / amount) * 100).toFixed(2),
    dataPoints,
    disclaimer: 'Hypothetical inflation assumption. Actual inflation varies.',
  });
});

/* ---- Investment Returns ---- */
const irSchema = z.object({
  initialInvestment:   z.number().min(0).max(100_000_000),
  monthlyContribution: z.number().min(0).max(1_000_000),
  annualReturn:        z.number().min(-50).max(100),
  years:               z.number().positive().max(50),
  annualFee:           z.number().min(0).max(5).optional(),
  inflationRate:       z.number().min(0).max(50).optional(),
});

router.post('/investment-returns', validate(irSchema), (req, res) => {
  const { initialInvestment, monthlyContribution, annualReturn, years, annualFee = 0, inflationRate = 6 } = req.validated;
  const r          = annualReturn / 100 / 12;
  const feeR       = annualFee   / 100 / 12;
  const inflationR = inflationRate / 100 / 12;
  const months     = Math.round(years * 12);

  const dataPoints = [];
  let gross = initialInvestment, net = initialInvestment, contributions = initialInvestment;
  for (let m = 1; m <= months; m++) {
    gross = gross * (1 + r)       + monthlyContribution;
    net   = net   * (1 + r - feeR)+ monthlyContribution;
    contributions += monthlyContribution;
    if (m % 12 === 0) {
      dataPoints.push({
        year: m / 12, gross: +gross.toFixed(2), net: +net.toFixed(2),
        contributions: +contributions.toFixed(2),
        inflationAdjusted: +(net / Math.pow(1 + inflationR, m)).toFixed(2),
      });
    }
  }

  res.json({
    grossFinalValue: +gross.toFixed(2), netFinalValue: +net.toFixed(2),
    totalContributions: +contributions.toFixed(2),
    feeDrag: +(gross - net).toFixed(2),
    inflationAdjustedValue: +(net / Math.pow(1 + inflationR, months)).toFixed(2),
    absoluteReturn: +((net - contributions) / Math.max(contributions, 1) * 100).toFixed(2),
    dataPoints,
    disclaimer: 'Hypothetical illustration only. Investment returns are not guaranteed.',
  });
});

module.exports = router;
