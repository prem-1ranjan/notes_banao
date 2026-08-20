package com.notesbanao.portal.wallet.dto;

/**
 * What a coupon would do, without applying it.
 *
 * A free_points coupon needs no payment, so only free_points is filled in. A
 * percent_off coupon does, so the amount fields are filled in instead and the
 * rest stay null.
 */
public record CouponPreview(
        String kind,
        boolean requires_payment,
        Integer free_points,
        Integer percent_off,
        String package_code,
        String currency,
        Long original_amount_paise,
        Long discounted_amount_paise,
        Integer original_total_points,
        Integer total_points) {

    public static CouponPreview freePoints(int freePoints) {
        return new CouponPreview("free_points", false, freePoints, null, null, null, null, null, null, null);
    }

    public static CouponPreview percentOff(int percentOff, String packageCode, String currency,
            long originalPaise, long discountedPaise, int totalPoints) {
        return new CouponPreview("percent_off", true, null, percentOff, packageCode, currency,
                originalPaise, discountedPaise, totalPoints, totalPoints);
    }
}
