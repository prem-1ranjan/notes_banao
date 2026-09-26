package com.notesbanao.portal.payment;

public record PaymentStatusResponse(
        boolean success,
        String orderId,
        String state,
        String message
) {
}