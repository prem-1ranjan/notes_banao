package com.notesbanao.portal.billing.dto;

/**
 * A GST invoice snapshot.
 *
 * The PDF is built in the browser from this JSON, so the same payload must
 * always produce the same document. Prices are GST inclusive, which is why
 * taxable_paise is worked back out of gross_paise rather than added to it.
 *
 * doc_type is either tax_invoice or receipt.
 */
public record InvoiceResponse(
        boolean ok,
        String doc_type,
        String invoice_number,
        String fy,
        InvoiceSeller seller,
        String place_of_supply,
        InvoiceBuyer buyer,
        String description,
        String sac_code,
        String currency,
        long gross_paise,
        long taxable_paise,
        long cgst_paise,
        long sgst_paise,
        long igst_paise,
        int gst_rate_bps,
        boolean reverse_charge,
        String created_at,
        String payment_order_id) {
}
