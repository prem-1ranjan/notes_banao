package com.notesbanao.portal.payment;

import com.notesbanao.portal.auth.SessionService;
import com.notesbanao.portal.auth.dto.UserDto;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final SessionService sessionService;

    public PaymentController(
            PaymentService paymentService,
            SessionService sessionService) {

        this.paymentService = paymentService;
        this.sessionService = sessionService;
    }

    @PostMapping("/create")
    public PaymentResponse createPayment(
            @RequestParam String gateway,
            @RequestBody PaymentRequest request,
            HttpServletRequest httpRequest) {

        UserDto user =
                sessionService.requireUser(httpRequest);

        return paymentService.createPayment(
                gateway,
                request,
                user
        );
    }

    @GetMapping("/status")
    public PaymentStatusResponse checkPaymentStatus(
            @RequestParam String gateway,
            @RequestParam String merchantOrderId,
            HttpServletRequest httpRequest) {

        UserDto user =
                sessionService.requireUser(httpRequest);

        return paymentService.checkPaymentStatus(
                gateway,
                merchantOrderId,
                user
        );
    }
}