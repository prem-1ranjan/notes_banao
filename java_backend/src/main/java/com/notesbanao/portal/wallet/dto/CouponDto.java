package com.notesbanao.portal.wallet.dto;

/** kind is either free_points or percent_off. */
public record CouponDto(String code, String kind, String description) {
}
