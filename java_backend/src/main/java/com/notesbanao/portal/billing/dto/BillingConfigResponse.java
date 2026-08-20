package com.notesbanao.portal.billing.dto;

import java.util.List;

public record BillingConfigResponse(
        boolean ok,
        List<RuleSetDto> rule_sets,
        List<DurationRuleDto> duration_rules,
        ReferralRewardDto referral_reward) {
}
