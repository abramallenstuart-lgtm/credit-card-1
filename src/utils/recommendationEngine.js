import { CREDIT_CARDS, STRATEGIES, POINT_VALUES, APPLICATION_RULES } from '../data/creditCards.js';

/**
 * Calculate the estimated annual value of a card for a user's spending profile.
 */
export function calculateCardValue(card, spendingProfile) {
  let totalPoints = 0;

  SPENDING_CATEGORIES_IDS.forEach((categoryId) => {
    const monthlySpend = spendingProfile[categoryId] || 0;
    const annualSpend = monthlySpend * 12;
    const multiplier = card.rewards[categoryId] || card.rewards.other || 1;
    totalPoints += annualSpend * multiplier;
  });

  const pointValue = POINT_VALUES[card.pointsProgram] || 1.0;
  const annualEarningsValue = (totalPoints * pointValue) / 100;

  const welcomeBonusValue = card.welcomeBonus?.estimatedValue || 0;

  const netFirstYearValue = annualEarningsValue + welcomeBonusValue - card.annualFee;
  const netOngoingValue = annualEarningsValue - card.annualFee;

  return {
    annualEarningsValue: Math.round(annualEarningsValue),
    welcomeBonusValue,
    netFirstYearValue: Math.round(netFirstYearValue),
    netOngoingValue: Math.round(netOngoingValue),
    totalPoints: Math.round(totalPoints),
  };
}

const SPENDING_CATEGORIES_IDS = [
  'dining', 'travel', 'groceries', 'gas', 'streaming', 'onlineShopping', 'drugstore', 'other',
];

/**
 * Check if user is eligible for a card based on application rules.
 */
export function checkCardEligibility(card, userProfile) {
  const issues = [];
  const warnings = [];

  // Check if user already holds this card
  const alreadyHolds = userProfile.currentCards?.some(c => c.cardId === card.id);
  if (alreadyHolds) {
    issues.push('You currently hold this card.');
  }

  // Chase 5/24
  if (card.applicationRules?.includes('chase524')) {
    const recentPersonalCards = (userProfile.currentCards || []).filter(c => {
      const openDate = new Date(c.openedDate);
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 24);
      return openDate >= cutoff && !c.isBusiness;
    });
    if (recentPersonalCards.length >= 5) {
      issues.push(`Chase 5/24: You've opened ${recentPersonalCards.length} personal cards in the past 24 months. Most Chase cards require fewer than 5.`);
    } else if (recentPersonalCards.length >= 4) {
      warnings.push(`Chase 5/24: You have ${recentPersonalCards.length}/5 recent cards. Apply for Chase cards before others to preserve your 5/24 slots.`);
    }
  }

  // Chase Sapphire 48-month rule
  if (card.applicationRules?.includes('cspFamily48')) {
    const hasSapphireBonus = (userProfile.currentCards || []).some(c => {
      if (!['chase-sapphire-preferred', 'chase-sapphire-reserve'].includes(c.cardId)) return false;
      const openDate = new Date(c.openedDate);
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 48);
      return openDate >= cutoff && c.receivedBonus !== false;
    });
    if (hasSapphireBonus) {
      issues.push('Chase Sapphire 48-Month Rule: You received a Sapphire bonus within the last 48 months. You must wait to earn another bonus.');
    }
  }

  // Amex 5-card limit
  if (card.applicationRules?.includes('amex5Cards')) {
    const amexCards = (userProfile.currentCards || []).filter(c => {
      const existingCard = CREDIT_CARDS.find(cc => cc.id === c.cardId);
      return existingCard && existingCard.bank === 'American Express';
    });
    if (amexCards.length >= 5) {
      issues.push(`Amex 5-Card Limit: You hold ${amexCards.length} Amex credit cards, which is the maximum.`);
    }
  }

  // Credit score check
  if (userProfile.creditScore && card.creditScoreMin) {
    if (userProfile.creditScore < card.creditScoreMin - 50) {
      issues.push(`Credit Score: This card typically requires ${card.creditScoreMin}+. Your score of ${userProfile.creditScore} may not qualify.`);
    } else if (userProfile.creditScore < card.creditScoreMin) {
      warnings.push(`Credit Score: This card typically requires ${card.creditScoreMin}+. Approval is possible but not guaranteed.`);
    }
  }

  return {
    eligible: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * Score a card against user's goals.
 */
function scoreCardForGoals(card, goals) {
  let score = 0;
  goals.forEach(goal => {
    if (card.bestFor?.includes(goal)) {
      score += 30;
    }
  });
  return score;
}

/**
 * Generate ranked card recommendations for a user.
 */
export function getRecommendations(userProfile) {
  const { spendingProfile = {}, goals = [], currentCards = [] } = userProfile;

  const currentCardIds = new Set(currentCards.map(c => c.cardId));

  const scoredCards = CREDIT_CARDS.map(card => {
    const value = calculateCardValue(card, spendingProfile);
    const eligibility = checkCardEligibility(card, userProfile);
    const goalScore = scoreCardForGoals(card, goals);

    // Skip if user already holds this card
    if (currentCardIds.has(card.id)) return null;

    // Composite score: first year value + goal alignment bonus
    const score = value.netFirstYearValue + goalScore;

    // Penalty for ineligibility (still show, but lower score)
    const adjustedScore = eligibility.eligible ? score : score - 500;

    return {
      card,
      value,
      eligibility,
      goalScore,
      score: adjustedScore,
    };
  }).filter(Boolean);

  scoredCards.sort((a, b) => b.score - a.score);

  return scoredCards;
}

/**
 * Get strategies relevant to the user's goals and current cards.
 */
export function getRelevantStrategies(userProfile) {
  const { goals = [], currentCards = [], forCouples = false } = userProfile;

  return STRATEGIES.filter(strategy => {
    // Filter couples strategies
    if (strategy.couplesSpecific && !forCouples) return false;

    // Check goal overlap
    const hasGoalMatch = strategy.bestFor.some(g => goals.includes(g));
    return hasGoalMatch;
  }).map(strategy => {
    const cardDetails = strategy.cards.map(id => CREDIT_CARDS.find(c => c.id === id)).filter(Boolean);
    const alreadyHaveCards = strategy.cards.filter(id => currentCards.some(c => c.cardId === id));
    const neededCards = strategy.cards.filter(id => !currentCards.some(c => c.cardId === id));

    return {
      ...strategy,
      cardDetails,
      alreadyHaveCards,
      neededCards,
      completionPercent: Math.round((alreadyHaveCards.length / strategy.cards.length) * 100),
    };
  }).sort((a, b) => b.completionPercent - a.completionPercent);
}

/**
 * Generate couples optimization strategy.
 */
export function getCouplesStrategy(person1Profile, person2Profile) {
  const p1Recs = getRecommendations(person1Profile);
  const p2Recs = getRecommendations(person2Profile);

  const combinedCurrentCards = new Set([
    ...person1Profile.currentCards.map(c => c.cardId),
    ...person2Profile.currentCards.map(c => c.cardId),
  ]);

  // Suggest person 1 gets Chase ecosystem, person 2 gets Amex ecosystem (or vice versa)
  const chaseCards = p1Recs.filter(r => r.card.bank === 'Chase').slice(0, 3);
  const amexCards = p2Recs.filter(r => r.card.bank === 'American Express').slice(0, 3);

  // Point pooling opportunities
  const chasePoolable = ['Chase'];
  const amexPoolable = ['American Express'];

  const suggestions = [
    {
      title: 'Divide and Conquer',
      description: 'Each partner focuses on a different points ecosystem to maximize flexibility and transfer partners.',
      person1Focus: 'Chase Ultimate Rewards (CSP/CSR + Freedom cards)',
      person2Focus: 'Amex Membership Rewards (Gold + Platinum)',
      benefit: 'Access to both Chase and Amex transfer partners, doubling your redemption options.',
    },
    {
      title: 'Double the Welcome Bonuses',
      description: "Apply for the same card separately to each earn the sign-up bonus. Chase allows household accounts to pool Ultimate Rewards points.",
      person1Focus: 'Apply for Chase Sapphire Preferred',
      person2Focus: 'Apply for Chase Sapphire Preferred (separate account)',
      benefit: 'Earn 2x the welcome bonus (~120,000 UR points combined).',
    },
    {
      title: 'Authorized User Strategy',
      description: 'Add each other as authorized users on your best earning cards to maximize category bonuses without additional applications.',
      person1Focus: 'Add P2 as authorized user on your Amex Gold (4x dining)',
      person2Focus: 'Add P1 as authorized user on your Chase Sapphire Reserve (3x travel)',
      benefit: 'Both partners earn top rates on all purchases with existing cards.',
    },
  ];

  return {
    suggestions,
    person1TopCards: chaseCards,
    person2TopCards: amexCards,
    combinedEcosystems: [...new Set([...chaseCards.map(r => r.card.bank), ...amexCards.map(r => r.card.bank)])],
  };
}

/**
 * Calculate how many Chase 5/24 slots a user has remaining.
 */
export function get524Status(currentCards) {
  const recentPersonalCards = (currentCards || []).filter(c => {
    const openDate = new Date(c.openedDate);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 24);
    return openDate >= cutoff && !c.isBusiness;
  });

  const count = recentPersonalCards.length;
  const remaining = Math.max(0, 5 - count);

  return {
    count,
    remaining,
    eligible: count < 5,
    status: count === 0
      ? 'excellent'
      : count < 3
        ? 'good'
        : count < 5
          ? 'caution'
          : 'over524',
  };
}
