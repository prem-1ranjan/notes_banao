package com.notesbanao.portal.wallet.dto;

public record CouponValidateResponse(boolean ok, CouponDto coupon, CouponPreview preview) {
}
