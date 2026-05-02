import { useState } from 'react';
import { CREDIT_CARDS } from '../data/creditCards.js';

const BANK_COLORS = {
  Chase: '#117ACA',
  'American Express': '#006FCF',
  Citi: '#003B82',
  'Capital One': '#D22222',
  'Bank of America': '#C3141C',
  Discover: '#FF6600',
  'Wells Fargo': '#CC0000',
};

const TIER_LABELS = {
  'no-fee': 'No Annual Fee',
  budget: 'Budget',
  mid: 'Mid-Tier',
  premium: 'Premium',
};

export default function CardRecommendations({ recommendations, onAddCard }) {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  const FILTERS = [
    { id: 'all', label: 'All Cards' },
    { id: 'no-fee', label: 'No Annual Fee' },
    { id: 'mid', label: 'Mid-Tier' },
    { id: 'premium', label: 'Premium' },
  ];

  const filtered = recommendations.filter(r => {
    if (filter === 'all') return true;
    return r.card.tier === filter;
  });

  if (recommendations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3>No recommendations yet</h3>
        <p>Fill in your spending profile and goals to get personalized recommendations.</p>
      </div>
    );
  }

  return (
    <div className="recommendations-panel">
      <div className="rec-header">
        <h2 className="rec-title">Your Card Recommendations</h2>
        <p className="rec-subtitle">
          Ranked by estimated first-year value based on your spending profile.
        </p>
      </div>

      <div className="filter-bar">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`filter-btn ${filter === f.id ? 'active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="cards-list">
        {filtered.map((rec, idx) => (
          <CardCard
            key={rec.card.id}
            rec={rec}
            rank={idx + 1}
            isExpanded={expanded === rec.card.id}
            onToggle={() => setExpanded(expanded === rec.card.id ? null : rec.card.id)}
            onAddCard={onAddCard}
          />
        ))}
      </div>
    </div>
  );
}

function CardCard({ rec, rank, isExpanded, onToggle, onAddCard }) {
  const { card, value, eligibility } = rec;
  const bankColor = BANK_COLORS[card.bank] || '#555';

  const eligibilityClass = eligibility.eligible
    ? 'eligible'
    : eligibility.issues.length > 0
      ? 'ineligible'
      : 'warning';

  return (
    <div className={`card-card ${!eligibility.eligible ? 'card-ineligible' : ''}`}
      style={{ '--bank-color': bankColor }}>
      <div className="card-card-header" onClick={onToggle}>
        <div className="card-rank">#{rank}</div>

        <div className="card-bank-bar" style={{ background: bankColor }} />

        <div className="card-card-info">
          <div className="card-card-top">
            <div className="card-meta">
              <span className="card-bank-label" style={{ color: bankColor }}>{card.bank}</span>
              {card.isBusinessCard && <span className="business-badge">Business</span>}
              <span className="card-tier-badge">{TIER_LABELS[card.tier] || card.tier}</span>
            </div>
            <div className="card-eligibility">
              {eligibility.eligible ? (
                <span className="elig-badge eligible">✓ Eligible</span>
              ) : (
                <span className="elig-badge ineligible">⚠ Restrictions</span>
              )}
            </div>
          </div>
          <h3 className="card-name">{card.name}</h3>
          <p className="card-description">{card.description}</p>
        </div>

        <div className="card-value-summary">
          <div className="value-box">
            <div className="value-label">Annual Fee</div>
            <div className="value-amount fee-amount">
              {card.annualFee === 0 ? 'Free' : `$${card.annualFee}`}
            </div>
          </div>
          {card.welcomeBonus?.estimatedValue > 0 && (
            <div className="value-box">
              <div className="value-label">Welcome Bonus</div>
              <div className="value-amount bonus-amount">~${card.welcomeBonus.estimatedValue}</div>
            </div>
          )}
          <div className="value-box highlight-box">
            <div className="value-label">Est. 1st Year Value</div>
            <div className={`value-amount year-value ${value.netFirstYearValue >= 0 ? 'positive' : 'negative'}`}>
              {value.netFirstYearValue >= 0 ? '+' : ''}{value.netFirstYearValue < 0 ? '-' : ''}$
              {Math.abs(value.netFirstYearValue).toLocaleString()}
            </div>
          </div>
          <button className="expand-btn" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="card-card-details">
          {/* Eligibility warnings/issues */}
          {(eligibility.issues.length > 0 || eligibility.warnings.length > 0) && (
            <div className="eligibility-section">
              {eligibility.issues.map((issue, i) => (
                <div key={i} className="alert alert-error">🚫 {issue}</div>
              ))}
              {eligibility.warnings.map((warn, i) => (
                <div key={i} className="alert alert-warning">⚠️ {warn}</div>
              ))}
            </div>
          )}

          <div className="details-grid">
            {/* Rewards Breakdown */}
            <div className="details-section">
              <h4 className="details-heading">Earnings Breakdown</h4>
              <div className="rewards-table">
                {Object.entries(card.rewards).map(([cat, rate]) => (
                  <div key={cat} className="reward-row">
                    <span className="reward-category">{formatCategory(cat)}</span>
                    <span className="reward-rate" style={{ color: rate >= 4 ? '#22c55e' : rate >= 3 ? '#3b82f6' : '#888' }}>
                      {rate}x
                    </span>
                  </div>
                ))}
              </div>
              <div className="points-program">
                <span className="points-label">Points Program:</span>
                <strong>{card.pointsProgram}</strong>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="details-section">
              <h4 className="details-heading">Key Benefits</h4>
              <ul className="benefits-list">
                {card.keyBenefits?.map((benefit, i) => (
                  <li key={i} className="benefit-item">✓ {benefit}</li>
                ))}
              </ul>
            </div>

            {/* Welcome Bonus */}
            {card.welcomeBonus?.estimatedValue > 0 && (
              <div className="details-section">
                <h4 className="details-heading">Welcome Bonus</h4>
                <div className="bonus-detail">
                  <div className="bonus-points">
                    {card.welcomeBonus.points.toLocaleString()} {card.welcomeBonus.currency}
                  </div>
                  <div className="bonus-meta">
                    ≈ ${card.welcomeBonus.estimatedValue} in value
                  </div>
                  <div className="bonus-req">
                    Spend ${card.welcomeBonus.spendRequired.toLocaleString()} in{' '}
                    {card.welcomeBonus.monthsToSpend} months
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Partners */}
            {card.transferPartners?.length > 0 && (
              <div className="details-section">
                <h4 className="details-heading">Transfer Partners</h4>
                <div className="transfer-partners">
                  {card.transferPartners.map(partner => (
                    <span key={partner} className="partner-badge">{partner}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Pros & Cons */}
            <div className="details-section pros-cons">
              <div className="pros">
                <h4 className="details-heading pros-heading">Pros</h4>
                <ul>
                  {card.pros?.map((pro, i) => (
                    <li key={i} className="pro-item">✓ {pro}</li>
                  ))}
                </ul>
              </div>
              <div className="cons">
                <h4 className="details-heading cons-heading">Cons</h4>
                <ul>
                  {card.cons?.map((con, i) => (
                    <li key={i} className="con-item">✗ {con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="card-actions">
            <a
              href={card.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="apply-btn"
              style={{ background: bankColor }}
            >
              Learn More & Apply →
            </a>
            {onAddCard && (
              <button
                onClick={() => onAddCard(card.id)}
                className="track-btn"
              >
                + Add to My Cards
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatCategory(cat) {
  const names = {
    dining: '🍽️ Dining',
    travel: '✈️ Travel',
    groceries: '🛒 Groceries',
    gas: '⛽ Gas',
    streaming: '📺 Streaming',
    onlineShopping: '🛍️ Online Shopping',
    drugstore: '💊 Drugstore',
    other: '💳 Everything Else',
    rotating: '🔄 Rotating Categories',
  };
  return names[cat] || cat;
}
