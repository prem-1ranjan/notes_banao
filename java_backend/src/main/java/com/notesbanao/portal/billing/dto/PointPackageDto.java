package com.notesbanao.portal.billing.dto;

/** A pack on the recharge screen. Prices are in paise. */
public record PointPackageDto(
        String code,
        String name,
        long price_paise,
        String currency,
        int base_points,
        int bonus_points,
        int total_points) {
}
