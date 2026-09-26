package com.notesbanao.portal.payment;

public record PaymentResponse(
        boolean success,
        String orderId,
        String redirectUrl
) {
}