package com.notesbanao.portal.billing;

import org.springframework.web.bind.annotation.RestController;

import com.notesbanao.portal.auth.SessionService;
import com.notesbanao.portal.billing.dto.BillingConfigResponse;
import com.notesbanao.portal.billing.dto.InvoiceResponse;
import com.notesbanao.portal.billing.dto.PackagesResponse;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class BillingController implements BillingApi {

    private final BillingService billingService;
    private final SessionService sessionService;

    public BillingController(BillingService billingService, SessionService sessionService) {
        this.billingService = billingService;
        this.sessionService = sessionService;
    }

    @Override
    public BillingConfigResponse config(HttpServletRequest request) {
        sessionService.requireUser(request);
        return billingService.config();
    }

    @Override
    public PackagesResponse packages(HttpServletRequest request) {
        sessionService.requireUser(request);
        return billingService.packages();
    }

    @Override
    public InvoiceResponse invoice(String orderId, HttpServletRequest request) {
        return billingService.invoice(orderId, sessionService.requireUser(request));
    }
}
