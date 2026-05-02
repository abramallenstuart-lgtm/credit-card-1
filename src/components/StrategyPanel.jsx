import { CREDIT_CARDS } from '../data/creditCards.js';

const DIFFICULTY_COLORS = {
  Beginner: '#22c55e',
  Intermediate: '#3b82f6',
  Advanced: '#f59e0b',
};

export default function StrategyPanel({ strategies, currentCards = [] }) {
  if (!strategies || strategies.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🗺️</div>
        <h3>No matching strategies</h3>
        <p>Select goals like Travel or Cash Back to unlock long-term strategies.</p>
      </div>
    );
  }

  return (
    <div className="strategies-panel">
      <div className="rec-header">
        <h2 className="rec-title">Long-Term Strategies</h2>
        <p className="rec-subtitle">
          Multi-card setups to maximize rewards over time. Cards you already have are highlighted.
        </p>
      </div>

      <div className="strategies-list">
        {strategies.map(strategy => (
          <StrategyCard key={strategy.id} strategy={strategy} currentCards={currentCards} />
        ))}
      </div>
    </div>
  );
}

function StrategyCard({ strategy, currentCards }) {
  const currentCardIds = new Set(currentCards.map(c => c.cardId));
  const diffColor = DIFFICULTY_COLORS[strategy.difficulty] || '#888';

  return (
    <div className="strategy-card">
      <div className="strategy-header">
        <div className="strategy-icon">{strategy.icon}</div>
        <div className="strategy-title-block">
          <h3 className="strategy-name">{strategy.name}</h3>
          <div className="strategy-meta">
            <span className="difficulty-badge" style={{ background: diffColor + '22', color: diffColor, border: `1px solid ${diffColor}` }}>
              {strategy.difficulty}
            </span>
            {strategy.couplesSpecific && (
              <span className="couples-badge">👫 Couples</span>
            )}
            <span className="strategy-banks">
              {strategy.banks.join(' + ')}
            </span>
          </div>
        </div>
        <div className="strategy-value">
          <div className="strategy-value-label">Est. Annual Value</div>
          <div className="strategy-value-amount">{strategy.estimatedAnnualValue}</div>
        </div>
      </div>

      {strategy.completionPercent > 0 && (
        <div className="completion-bar-wrap">
          <div className="completion-label">
            You have {strategy.alreadyHaveCards?.length} of {strategy.cards?.length} cards
          </div>
          <div className="completion-bar">
            <div
              className="completion-fill"
              style={{ width: `${strategy.completionPercent}%` }}
            />
          </div>
        </div>
      )}

      <p className="strategy-description">{strategy.description}</p>

      <div className="strategy-cards-grid">
        {strategy.cardDetails?.map(card => {
          const owned = currentCardIds.has(card.id);
          return (
            <div key={card.id} className={`strategy-card-pill ${owned ? 'owned' : ''}`}>
              <div className="pill-bank">{card.bank}</div>
              <div className="pill-name">{card.name}</div>
              <div className="pill-fee">
                {card.annualFee === 0 ? 'No fee' : `$${card.annualFee}/yr`}
              </div>
              {owned && <div className="owned-badge">✓ You have this</div>}
            </div>
          );
        })}
      </div>

      <div className="strategy-how-section">
        <h4 className="how-title">How It Works</h4>
        <ol className="how-list">
          {strategy.howItWorks?.map((step, i) => (
            <li key={i} className="how-item">{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
