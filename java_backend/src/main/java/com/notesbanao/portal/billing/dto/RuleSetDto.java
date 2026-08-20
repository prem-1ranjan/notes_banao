package com.notesbanao.portal.billing.dto;

/** The Billing screen only shows rule sets whose product_code is note_generation. */
public record RuleSetDto(String id, String code, String product_code, String billing_mode, int active) {
}
