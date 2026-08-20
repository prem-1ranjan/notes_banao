package com.notesbanao.portal.wallet.dto;

/** package_code is only needed for a percentage coupon. */
public record CouponRequest(String code, String package_code) {
}
