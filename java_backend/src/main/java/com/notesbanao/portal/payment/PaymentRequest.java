package com.notesbanao.portal.payment;

public record PaymentRequest(
        String packageCode,
        String couponCode
) {
}