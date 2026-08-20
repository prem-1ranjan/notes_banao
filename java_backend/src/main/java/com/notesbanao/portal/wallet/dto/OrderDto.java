package com.notesbanao.portal.wallet.dto;

/** A payment order. Only a paid one has an invoice. */
public record OrderDto(
        String id,
        String package_code,
        long amount_paise,
        String currency,
        int base_points,
        int bonus_points,
        int total_points,
        String status,
        String created_at) {
}
