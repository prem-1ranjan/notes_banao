package com.notesbanao.portal.billing.dto;

/** Who is issuing the invoice. Configured under portal.seller. */
public record InvoiceSeller(
        String legal_name,
        String gstin,
        String address,
        String state_name,
        String state_code) {
}
