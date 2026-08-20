package com.notesbanao.portal.billing;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.notesbanao.portal.billing.dto.BillingConfigResponse;
import com.notesbanao.portal.billing.dto.InvoiceResponse;
import com.notesbanao.portal.billing.dto.PackagesResponse;

import jakarta.servlet.http.HttpServletRequest;

/** Pricing rules, the packs on sale, and invoices for completed payments. */
@RequestMapping("/api/billing")
public interface BillingApi {

    @GetMapping("/config")
    BillingConfigResponse config(HttpServletRequest request);

    @GetMapping("/packages")
    PackagesResponse packages(HttpServletRequest request);

    /** Only a paid order has an invoice; anything else is an error. */
    @GetMapping("/invoice/{orderId}")
    InvoiceResponse invoice(@PathVariable String orderId, HttpServletRequest request);
}
