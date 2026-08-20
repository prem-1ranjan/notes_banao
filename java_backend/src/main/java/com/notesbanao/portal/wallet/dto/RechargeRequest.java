package com.notesbanao.portal.wallet.dto;

/** coupon_code is optional. */
public record RechargeRequest(String package_code, String gateway, String coupon_code) {
}
