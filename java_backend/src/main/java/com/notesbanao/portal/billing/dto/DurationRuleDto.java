package com.notesbanao.portal.billing.dto;

/** What a note costs, by recording length. A null max means "and above". */
public record DurationRuleDto(
        String id,
        String rule_set_code,
        int min_duration_seconds,
        Integer max_duration_seconds,
        int charge_points,
        String label,
        int sort_order,
        int active) {
}
