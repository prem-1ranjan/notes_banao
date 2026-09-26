package com.notesbanao.portal.payment;

import com.notesbanao.portal.auth.dto.UserDto;

public interface PaymentGateway {

    PaymentResponse createPayment(
            PaymentRequest request,
            UserDto user
    );

    PaymentStatusResponse checkPaymentStatus(
            String merchantOrderId,
            UserDto user
    );
}