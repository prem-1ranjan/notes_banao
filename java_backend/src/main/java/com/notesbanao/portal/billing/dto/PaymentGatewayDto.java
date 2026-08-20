package com.notesbanao.portal.billing.dto;

public record PaymentGatewayDto(
        String code,
        String display_name,
        String provider_type,
        String environment,
        boolean active,
        int sort_order) {
}
