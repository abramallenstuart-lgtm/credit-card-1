import { useState } from 'react';
import { SPENDING_CATEGORIES, GOALS } from '../data/creditCards.js';

const CREDIT_SCORE_OPTIONS = [
  { value: 580, label: 'Fair (580–669)' },
  { value: 670, label: 'Good (670–739)' },
  { value: 740, label: 'Very Good (740–799)' },
  { value: 800, label: 'Excellent (800+)' },
];

export default function SpendingForm({ onSubmit, initialData }) {
  const [spending, setSpending] = useState(
    initialData?.spending || Object.fromEntries(SPENDING_CATEGORIES.map(c => [c.id, '']))
  );
  const [goals, setGoals] = useState(initialData?.goals || []);
  const [creditScore, setCreditScore] = useState(initialData?.creditScore || 740);
  const [forCouples, setForCouples] = useState(initialData?.forCouples || false);
  const [errors, setErrors] = useState({});

  const handleSpendingChange = (categoryId, value) => {
    const numVal = value === '' ? '' : Math.max(0, parseInt(value, 10) || 0);
    setSpending(prev => ({ ...prev, [categoryId]: numVal }));
    if (errors[categoryId]) {
      setErrors(prev => ({ ...prev, [categoryId]: null }));
    }
  };

  const toggleGoal = (goalId) => {
    setGoals(prev =>
      prev.includes(goalId) ? prev.filter(g => g !== goalId) : [...prev, goalId]
    );
    if (errors.goals) setErrors(prev => ({ ...prev, goals: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (goals.length === 0) {
      newErrors.goals = 'Please select at least one goal.';
    }
    const totalSpend = Object.values(spending).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
    if (totalSpend === 0) {
      newErrors.spending = 'Please enter your monthly spending in at least one category.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const spendingNums = Object.fromEntries(
      Object.entries(spending).map(([k, v]) => [k, parseInt(v) || 0])
    );
    onSubmit({ spending: spendingNums, goals, creditScore, forCouples });
  };

  const totalMonthly = Object.values(spending).reduce((sum, v) => sum + (parseInt(v) || 0), 0);

  return (
    <form onSubmit={handleSubmit} className="spending-form">
      <div className="form-section">
        <h2 className="form-section-title">
          <span className="section-icon">💳</span>
          Monthly Spending
        </h2>
        <p className="form-hint">Enter your average monthly spending in each category. Estimates are fine!</p>
        {errors.spending && <div className="form-error">{errors.spending}</div>}
        <div className="spending-grid">
          {SPENDING_CATEGORIES.map(cat => (
            <div key={cat.id} className="spending-item">
              <label className="spending-label">
                <span className="spending-icon">{cat.icon}</span>
                <span className="spending-name">{cat.label}</span>
              </label>
              <div className="spending-input-wrap">
                <span className="dollar-sign">$</span>
                <input
                  type="number"
                  min="0"
                  max="99999"
                  placeholder="0"
                  value={spending[cat.id]}
                  onChange={e => handleSpendingChange(cat.id, e.target.value)}
                  className="spending-input"
                />
                <span className="per-month">/mo</span>
              </div>
            </div>
          ))}
        </div>
        {totalMonthly > 0 && (
          <div className="total-spend-bar">
            Total Monthly Spend: <strong>${totalMonthly.toLocaleString()}</strong>
            <span className="annual-spend"> (${(totalMonthly * 12).toLocaleString()}/year)</span>
          </div>
        )}
      </div>

      <div className="form-section">
        <h2 className="form-section-title">
          <span className="section-icon">🎯</span>
          Your Goals
        </h2>
        <p className="form-hint">Select all that apply. We'll tailor recommendations to your priorities.</p>
        {errors.goals && <div className="form-error">{errors.goals}</div>}
        <div className="goals-grid">
          {GOALS.map(goal => (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleGoal(goal.id)}
              className={`goal-btn ${goals.includes(goal.id) ? 'selected' : ''}`}
            >
              <div className="goal-label">{goal.label}</div>
              <div className="goal-desc">{goal.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h2 className="form-section-title">
          <span className="section-icon">📊</span>
          Credit Score
        </h2>
        <p className="form-hint">Helps us filter out cards you're unlikely to be approved for.</p>
        <div className="credit-score-options">
          {CREDIT_SCORE_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`credit-score-option ${creditScore === opt.value ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="creditScore"
                value={opt.value}
                checked={creditScore === opt.value}
                onChange={() => setCreditScore(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h2 className="form-section-title">
          <span className="section-icon">💑</span>
          Couples Strategy
        </h2>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={forCouples}
            onChange={e => setForCouples(e.target.checked)}
            className="toggle-input"
          />
          <span className="toggle-track">
            <span className="toggle-thumb" />
          </span>
          <span className="toggle-text">
            Optimize for two people{' '}
            <span className="toggle-sub">Get strategies to maximize points across a household</span>
          </span>
        </label>
      </div>

      <button type="submit" className="submit-btn">
        Get My Recommendations →
      </button>
    </form>
  );
}
