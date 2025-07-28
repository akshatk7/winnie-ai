import { CampaignAction, ActionVariant, messagingActions, promotionalActions } from '@/data/actionLibrary';

interface SelectedAction {
  action: CampaignAction;
  variant: ActionVariant;
}

interface CampaignMetrics {
  totalReach: number;
  expectedReactivations: number;
  totalCost: number;
  projectedROI: number;
}

interface RecommendedCampaign {
  selectedActions: SelectedAction[];
  metrics: CampaignMetrics;
}

export const generateRecommendedCampaign = (budget: number): RecommendedCampaign => {
  const allActions = [...messagingActions, ...promotionalActions];
  const selectedActions: SelectedAction[] = [];

  // Always include core messaging (they're free)
  const emailAction = messagingActions.find(a => a.id === 'email_templates');
  const smsAction = messagingActions.find(a => a.id === 'sms_templates');
  const pushAction = messagingActions.find(a => a.id === 'push_notifications');

  if (emailAction) {
    selectedActions.push({
      action: emailAction,
      variant: emailAction.variants[0] // Welcome back series
    });
  }

  if (smsAction) {
    selectedActions.push({
      action: smsAction,
      variant: smsAction.variants[0] // Quick tips
    });
  }

  if (pushAction) {
    selectedActions.push({
      action: pushAction,
      variant: pushAction.variants[1] // Usage insights
    });
  }

  // Add promotional actions based on budget
  let remainingBudget = budget;
  const availablePromos = promotionalActions.filter(action => 
    action.variants.some(variant => variant.cost <= remainingBudget)
  );

  // Prioritize discount offers for broader reach
  const discountAction = availablePromos.find(a => a.id === 'discount_offers');
  if (discountAction && remainingBudget >= 50) {
    let selectedVariant = discountAction.variants[0]; // 10% discount
    
    // Choose variant based on budget per user (cost * reach)
    const budgetPerUser = remainingBudget / 12000;
    if (budgetPerUser >= 5) {
      selectedVariant = discountAction.variants[1]; // 20% discount
    }
    if (budgetPerUser >= 7.5) {
      selectedVariant = discountAction.variants[2]; // 30% discount
    }

    const totalActionCost = selectedVariant.cost * discountAction.variants[0].reach;
    if (totalActionCost <= remainingBudget) {
      selectedActions.push({
        action: discountAction,
        variant: selectedVariant
      });
      remainingBudget -= totalActionCost;
    }
  }

  // Add free months if budget allows
  if (remainingBudget >= 180000) { // 15 * 12000
    const freeMonthAction = availablePromos.find(a => a.id === 'free_months');
    if (freeMonthAction) {
      const selectedVariant = freeMonthAction.variants[0]; // 1 month free
      const totalActionCost = selectedVariant.cost * freeMonthAction.variants[0].reach;
      if (totalActionCost <= remainingBudget) {
        selectedActions.push({
          action: freeMonthAction,
          variant: selectedVariant
        });
        remainingBudget -= totalActionCost;
      }
    }
  }

  // Calculate metrics
  const metrics = calculateCampaignMetrics(selectedActions);

  return {
    selectedActions,
    metrics
  };
};

export const calculateCampaignMetrics = (selectedActions: SelectedAction[]): CampaignMetrics => {
  // Calculate total cost (cost per user * reach)
  const totalCost = selectedActions.reduce((sum, sa) => {
    return sum + (sa.variant.cost * sa.variant.reach);
  }, 0);
  
  // Calculate max reach across all actions
  let totalReach = 0;
  if (selectedActions.length > 0) {
    totalReach = Math.max(...selectedActions.map(sa => sa.variant.reach));
  }

  // Calculate expected reactivations based on impact
  let expectedReactivations = 0;
  selectedActions.forEach(sa => {
    const impactRate = sa.variant.expectedImpact / 100; // Convert percentage to decimal
    expectedReactivations += Math.floor(sa.variant.reach * impactRate);
  });

  // Calculate ROI (assuming $50 average customer value)
  const projectedRevenue = expectedReactivations * 50;
  const projectedROI = totalCost > 0 ? (projectedRevenue - totalCost) / totalCost : 0;

  return {
    totalReach,
    expectedReactivations,
    totalCost,
    projectedROI
  };
};