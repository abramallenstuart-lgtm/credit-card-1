export default function CouplesStrategy({ strategies, person1Recs = [], person2Recs = [] }) {
  const couplesStrategies = strategies?.filter(s => s.couplesSpecific) || [];

  const suggestions = [
    {
      icon: '🔀',
      title: 'Divide Ecosystems',
      description: 'Person 1 focuses on Chase Ultimate Rewards (Sapphire + Freedom cards). Person 2 focuses on Amex Membership Rewards (Gold + Platinum). Each earns separately but both have access to every transfer partner.',
      person1: ['Chase Sapphire Preferred/Reserve', 'Chase Freedom Unlimited', 'Chase Freedom Flex'],
      person2: ['Amex Gold Card', 'Amex Platinum', 'Amex Blue Business Plus'],
      benefit: 'Access to 15+ airline & hotel partners across both ecosystems. Transfer Chase → Hyatt, Amex → Singapore Airlines, etc.',
      annualBonus: '~180,000 – 250,000 combined points from welcome bonuses',
    },
    {
      icon: '📝',
      title: 'Double the Sign-Up Bonuses',
      description: 'Both apply for the same high-value cards separately. Chase allows households to combine/transfer Ultimate Rewards points between spouses.',
      person1: ['Chase Sapphire Preferred (60K UR bonus)'],
      person2: ['Chase Sapphire Preferred (60K UR bonus)'],
      benefit: 'Combined 120,000 UR points ≈ $2,160+ in travel value when transferred to Hyatt or United.',
      annualBonus: '~120,000 UR points combined',
    },
    {
      icon: '👥',
      title: 'Authorized User Strategy',
      description: 'Add each other as authorized users on high-value earning cards. Both partners earn the card\'s top rates without needing separate applications (protecting Chase 5/24 slots).',
      person1: ['Add P2 as AU on Amex Gold (4x dining/groceries)', 'Add P2 as AU on CSR (3x travel)'],
      person2: ['Add P1 as AU on Venture X (10x hotels)', 'Add P1 as AU on Citi Strata Premier (3x everything)'],
      benefit: 'Both earn top category rates on shared purchases. Amex AU cards don\'t add to 5/24 count.',
      annualBonus: 'Maximize all categories without using 5/24 slots',
    },
    {
      icon: '🏨',
      title: 'Hotel Loyalty Split',
      description: 'One partner targets Hyatt (via Chase UR transfers) while the other builds Marriott Bonvoy status (via Amex). Together, you cover the two best hotel programs.',
      person1: ['Chase Sapphire Reserve → Transfer to Hyatt', 'World of Hyatt Credit Card'],
      person2: ['Amex Platinum (Marriott Gold status)', 'Marriott Bonvoy Brilliant Amex'],
      benefit: 'Free nights and upgrades at both Hyatt and Marriott properties worldwide. Hyatt points often worth 2-3¢ each.',
      annualBonus: 'Elite status + free nights at two major hotel programs',
    },
    {
      icon: '✈️',
      title: 'Airline Award Stacking',
      description: 'One partner accumulates United miles (via Chase), the other accumulates Delta miles (via Amex). Book award flights for each other on partner carriers.',
      person1: ['Chase Sapphire Reserve → United MileagePlus', 'United Explorer Card'],
      person2: ['Amex Gold/Platinum → Delta SkyMiles', 'Delta SkyMiles Amex Reserve'],
      benefit: 'Use United miles to book Star Alliance partners. Use Delta miles for SkyTeam partners. Double the airline options.',
      annualBonus: 'Access to 40+ airlines across Star Alliance + SkyTeam',
    },
  ];

  return (
    <div className="couples-panel">
      <div className="rec-header">
        <h2 className="rec-title">Couples Strategy Guide 💑</h2>
        <p className="rec-subtitle">
          Coordinating credit cards across two people dramatically multiplies your earning potential. Here are the most powerful strategies for couples.
        </p>
      </div>

      <div className="couples-intro-box">
        <div className="couples-intro-icon">💡</div>
        <div>
          <strong>Key Principle:</strong> Two people = double the welcome bonuses, double the 5/24 slots, and access to two full points ecosystems simultaneously. Couples who optimize together can easily earn 400,000+ points per year.
        </div>
      </div>

      <div className="suggestions-list">
        {suggestions.map((s, idx) => (
          <div key={idx} className="suggestion-card">
            <div className="suggestion-header">
              <span className="suggestion-icon">{s.icon}</span>
              <h3 className="suggestion-title">{s.title}</h3>
            </div>
            <p className="suggestion-desc">{s.description}</p>

            <div className="persons-grid">
              <div className="person-column">
                <div className="person-label">👤 Person 1</div>
                <ul className="person-cards">
                  {s.person1.map((card, i) => <li key={i}>{card}</li>)}
                </ul>
              </div>
              <div className="person-divider">+</div>
              <div className="person-column">
                <div className="person-label">👤 Person 2</div>
                <ul className="person-cards">
                  {s.person2.map((card, i) => <li key={i}>{card}</li>)}
                </ul>
              </div>
            </div>

            <div className="suggestion-benefit">
              <div className="benefit-label">💎 Combined Benefit</div>
              <div className="benefit-text">{s.benefit}</div>
            </div>

            {s.annualBonus && (
              <div className="annual-bonus-chip">
                🎁 {s.annualBonus}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="couples-tips">
        <h3 className="tips-title">⚡ Essential Rules for Couples</h3>
        <div className="tips-grid">
          {[
            { icon: '📋', tip: "Chase allows spouses to transfer Ultimate Rewards points to each other's accounts for free — pool all UR into one account before booking." },
            { icon: '⏱️', tip: 'Stagger applications. Don\'t both apply for the same card on the same day — wait 60-90 days between applications in the same bank family.' },
            { icon: '🚫', tip: "Amex's once-per-lifetime bonus rule is per person. If P1 had the Amex Gold before, P2 can still get the full bonus on their new account." },
            { icon: '💳', tip: "Adding your partner as an authorized user on Chase or Amex cards lets them earn points in your account — and some AUs count toward elite status thresholds." },
            { icon: '🏦', tip: "Business cards (like Ink Business Preferred) don't count against 5/24. Both partners can get business cards without using personal 5/24 slots." },
            { icon: '📊', tip: 'Keep a shared spreadsheet tracking each card, open date, annual fee due date, and minimum spend deadline to avoid missing out on bonuses.' },
          ].map((tip, i) => (
            <div key={i} className="tip-item">
              <span className="tip-icon">{tip.icon}</span>
              <span className="tip-text">{tip.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
