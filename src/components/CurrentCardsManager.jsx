import { useState } from 'react';
import { CREDIT_CARDS } from '../data/creditCards.js';

export default function CurrentCardsManager({ currentCards, onChange }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCard, setNewCard] = useState({ cardId: '', openedDate: '', isBusiness: false, receivedBonus: true });
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!newCard.cardId) { setError('Please select a card.'); return; }
    if (!newCard.openedDate) { setError('Please enter the date you opened this card.'); return; }

    // Don't allow duplicates
    if (currentCards.some(c => c.cardId === newCard.cardId)) {
      setError('You already have this card in your list.');
      return;
    }

    onChange([...currentCards, { ...newCard, id: Date.now() }]);
    setNewCard({ cardId: '', openedDate: '', isBusiness: false, receivedBonus: true });
    setIsAdding(false);
    setError('');
  };

  const handleRemove = (id) => {
    onChange(currentCards.filter(c => c.id !== id));
  };

  // Group cards for display
  const cardsByBank = {};
  currentCards.forEach(c => {
    const cardData = CREDIT_CARDS.find(cc => cc.id === c.cardId);
    if (!cardData) return;
    if (!cardsByBank[cardData.bank]) cardsByBank[cardData.bank] = [];
    cardsByBank[cardData.bank].push({ ...c, cardData });
  });

  // Compute 5/24 count
  const recentPersonalCards = currentCards.filter(c => {
    const openDate = new Date(c.openedDate);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 24);
    return openDate >= cutoff && !c.isBusiness;
  });
  const count524 = recentPersonalCards.length;

  return (
    <div className="current-cards-manager">
      <div className="manager-header">
        <h2 className="manager-title">
          <span className="section-icon">🗂️</span>
          Cards You Currently Hold
        </h2>
        <p className="manager-hint">
          Add your existing cards so we can apply application rules (like Chase 5/24) and avoid recommending cards you already have.
        </p>
      </div>

      {/* 5/24 status indicator */}
      <div className={`status-524 status-${count524 === 0 ? 'excellent' : count524 < 3 ? 'good' : count524 < 5 ? 'caution' : 'over'}`}>
        <div className="status-524-title">Chase 5/24 Status</div>
        <div className="status-524-count">
          <span className="count-num">{count524}</span>
          <span className="count-slash">/5</span>
        </div>
        <div className="status-524-msg">
          {count524 === 0 && 'Clean slate — eligible for all Chase cards.'}
          {count524 > 0 && count524 < 3 && `${5 - count524} slots remaining. Good standing.`}
          {count524 >= 3 && count524 < 5 && `⚠️ Only ${5 - count524} slot${5 - count524 === 1 ? '' : 's'} left. Prioritize Chase cards!`}
          {count524 >= 5 && '🚫 Over 5/24. Most Chase cards unavailable until cards age out.'}
        </div>
      </div>

      {/* Cards list */}
      {Object.entries(cardsByBank).length > 0 ? (
        <div className="current-cards-list">
          {Object.entries(cardsByBank).map(([bank, cards]) => (
            <div key={bank} className="bank-group">
              <div className="bank-group-name">{bank}</div>
              {cards.map(c => (
                <div key={c.id} className="current-card-row">
                  <div className="current-card-info">
                    <div className="current-card-name">{c.cardData.name}</div>
                    <div className="current-card-meta">
                      Opened: {new Date(c.openedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {c.isBusiness && ' · Business'}
                      {c.receivedBonus && ' · Got bonus'}
                    </div>
                  </div>
                  <button className="remove-card-btn" onClick={() => handleRemove(c.id)} aria-label="Remove">✕</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-cards-msg">No cards added yet.</div>
      )}

      {/* Add card form */}
      {isAdding ? (
        <div className="add-card-form">
          <div className="add-card-fields">
            <div className="add-field">
              <label className="add-field-label">Card</label>
              <select
                value={newCard.cardId}
                onChange={e => { setNewCard(prev => ({ ...prev, cardId: e.target.value })); setError(''); }}
                className="add-select"
              >
                <option value="">Select a card…</option>
                {CREDIT_CARDS.map(card => (
                  <option key={card.id} value={card.id}>{card.bank} – {card.name}</option>
                ))}
              </select>
            </div>
            <div className="add-field">
              <label className="add-field-label">Date Opened</label>
              <input
                type="month"
                value={newCard.openedDate}
                max={new Date().toISOString().slice(0, 7)}
                onChange={e => { setNewCard(prev => ({ ...prev, openedDate: e.target.value + '-01' })); setError(''); }}
                className="add-input"
              />
            </div>
            <div className="add-field add-checkboxes">
              <label className="check-label">
                <input type="checkbox" checked={newCard.isBusiness}
                  onChange={e => setNewCard(prev => ({ ...prev, isBusiness: e.target.checked }))} />
                Business card
              </label>
              <label className="check-label">
                <input type="checkbox" checked={newCard.receivedBonus}
                  onChange={e => setNewCard(prev => ({ ...prev, receivedBonus: e.target.checked }))} />
                Received welcome bonus
              </label>
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="add-card-actions">
            <button className="add-confirm-btn" onClick={handleAdd}>Add Card</button>
            <button className="add-cancel-btn" onClick={() => { setIsAdding(false); setError(''); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="add-card-trigger" onClick={() => setIsAdding(true)}>
          + Add a Card You Hold
        </button>
      )}
    </div>
  );
}
