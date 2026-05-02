import { useState, useCallback } from 'react';
import SpendingForm from './components/SpendingForm.jsx';
import CardRecommendations from './components/CardRecommendations.jsx';
import StrategyPanel from './components/StrategyPanel.jsx';
import CouplesStrategy from './components/CouplesStrategy.jsx';
import CurrentCardsManager from './components/CurrentCardsManager.jsx';
import { getRecommendations, getRelevantStrategies } from './utils/recommendationEngine.js';
import './App.css';

const TABS = [
  { id: 'recommendations', label: '🃏 Card Picks', shortLabel: 'Cards' },
  { id: 'strategies', label: '🗺️ Strategies', shortLabel: 'Strategies' },
  { id: 'couples', label: '💑 Couples', shortLabel: 'Couples' },
];

export default function App() {
  const [currentCards, setCurrentCards] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleFormSubmit = useCallback((formData) => {
    const profile = {
      spendingProfile: formData.spending,
      goals: formData.goals,
      creditScore: formData.creditScore,
      forCouples: formData.forCouples,
      currentCards,
    };

    setUserProfile(profile);

    const recs = getRecommendations(profile);
    setRecommendations(recs);

    const strats = getRelevantStrategies(profile);
    setStrategies(strats);

    setHasSubmitted(true);

    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [currentCards]);

  const handleAddCard = useCallback((cardId) => {
    const today = new Date().toISOString().slice(0, 10);
    const newCard = { id: Date.now(), cardId, openedDate: today, isBusiness: false, receivedBonus: true };
    setCurrentCards(prev => {
      if (prev.some(c => c.cardId === cardId)) return prev;
      return [...prev, newCard];
    });
  }, []);

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">💳</span>
            <div>
              <div className="logo-name">PointsOptimizer</div>
              <div className="logo-tagline">Credit Card Strategy for Power Users</div>
            </div>
          </div>
          <nav className="header-nav">
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#form-section" className="nav-link cta-nav">Get Recommendations</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">Advanced Credit Card Strategy</div>
          <h1 className="hero-title">Stop Leaving Points on the Table</h1>
          <p className="hero-subtitle">
            Get personalized credit card recommendations based on your actual spending, current cards, and long-term goals — including multi-bank strategies and couples optimization.
          </p>
          <div className="hero-features">
            {[
              { icon: '🎯', text: 'Tailored to your spending' },
              { icon: '⚡', text: 'Chase 5/24 aware' },
              { icon: '💑', text: 'Couples strategies' },
              { icon: '🗺️', text: 'Long-term ecosystems' },
            ].map((f, i) => (
              <div key={i} className="hero-feature">
                <span>{f.icon}</span> {f.text}
              </div>
            ))}
          </div>
          <a href="#form-section" className="hero-cta">Start Optimizing →</a>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="section-inner">
          <h2 className="section-heading">How It Works</h2>
          <div className="steps-grid">
            {[
              { step: '1', icon: '📝', title: 'Enter Your Spending', desc: 'Tell us how much you spend on dining, travel, groceries, and more each month.' },
              { step: '2', icon: '🗂️', title: 'Add Your Current Cards', desc: 'We factor in application rules like Chase 5/24, Sapphire 48-month, and Amex limits.' },
              { step: '3', icon: '🎯', title: 'Choose Your Goals', desc: 'Cash back, travel rewards, lounge access, airline miles — we optimize for what you want.' },
              { step: '4', icon: '✨', title: 'Get Your Strategy', desc: 'Receive ranked card picks, long-term ecosystem strategies, and couples optimization plans.' },
            ].map((s) => (
              <div key={s.step} className="step-card">
                <div className="step-number">{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="main-section" id="form-section">
        <div className="main-inner">
          <div className="main-layout">
            <div className="left-panel">
              <CurrentCardsManager currentCards={currentCards} onChange={setCurrentCards} />
              <div className="form-card">
                <SpendingForm
                  onSubmit={handleFormSubmit}
                  initialData={userProfile ? {
                    spending: userProfile.spendingProfile,
                    goals: userProfile.goals,
                    creditScore: userProfile.creditScore,
                    forCouples: userProfile.forCouples,
                  } : null}
                />
              </div>
            </div>

            <div className="right-panel" id="results-section">
              {!hasSubmitted ? (
                <div className="results-placeholder">
                  <div className="placeholder-icon">💳</div>
                  <h3 className="placeholder-title">Your recommendations will appear here</h3>
                  <p className="placeholder-text">
                    Fill out the form on the left and click <strong>Get My Recommendations</strong> to see personalized card picks, strategy plans, and couples optimization.
                  </p>
                  <div className="placeholder-preview">
                    <div className="preview-item">🃏 Ranked card picks</div>
                    <div className="preview-item">🗺️ Chase Trifecta &amp; Amex strategies</div>
                    <div className="preview-item">💑 Couples coordination guide</div>
                    <div className="preview-item">⚡ Application rule checker</div>
                  </div>
                </div>
              ) : (
                <div className="results-panel">
                  <div className="tabs">
                    {TABS.map(tab => {
                      if (tab.id === 'couples' && !userProfile?.forCouples) return null;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        >
                          <span className="tab-full">{tab.label}</span>
                          <span className="tab-short">{tab.shortLabel}</span>
                          {tab.id === 'recommendations' && (
                            <span className="tab-count">{recommendations.length}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="tab-content">
                    {activeTab === 'recommendations' && (
                      <CardRecommendations recommendations={recommendations} onAddCard={handleAddCard} />
                    )}
                    {activeTab === 'strategies' && (
                      <StrategyPanel strategies={strategies} currentCards={currentCards} />
                    )}
                    {activeTab === 'couples' && userProfile?.forCouples && (
                      <CouplesStrategy
                        strategies={strategies}
                        person1Recs={recommendations.filter(r => r.card.bank === 'Chase')}
                        person2Recs={recommendations.filter(r => r.card.bank === 'American Express')}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-logo">💳 PointsOptimizer</div>
          <p className="footer-disclaimer">
            Card details, bonuses, and benefits change frequently. Always verify current offers directly with the issuer before applying.
            This tool is for informational purposes only and does not constitute financial advice.
          </p>
          <p className="footer-copy">© {new Date().getFullYear()} PointsOptimizer. Not affiliated with any credit card issuer.</p>
        </div>
      </footer>
    </div>
  );
}
