package com.notesbanao.portal.payment;

import com.notesbanao.portal.auth.dto.UserDto;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class PaymentService {

    private final Map<String, PaymentGateway> gateways;

    public PaymentService(Map<String, PaymentGateway> gateways) {
        this.gateways = gateways;
    }

    public PaymentResponse createPayment(
            String gatewayCode,
            PaymentRequest request,
            UserDto user) {

        PaymentGateway gateway = gateways.get(gatewayCode);

        if (gateway == null) {
            throw new IllegalArgumentException(
                    "Unsupported payment gateway: " + gatewayCode
            );
        }

        return gateway.createPayment(request, user);
    }

    public PaymentStatusResponse checkPaymentStatus(
            String gatewayCode,
            String merchantOrderId,
            UserDto user) {

        PaymentGateway gateway = gateways.get(gatewayCode);

        if (gateway == null) {
            throw new IllegalArgumentException(
                    "Unsupported payment gateway: " + gatewayCode
            );
        }

        return gateway.checkPaymentStatus(
                merchantOrderId,
                user
        );
    }
}