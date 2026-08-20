package com.notesbanao.portal.billing;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.notesbanao.portal.auth.dto.UserDto;
import com.notesbanao.portal.billing.dto.BillingConfigResponse;
import com.notesbanao.portal.billing.dto.InvoiceBuyer;
import com.notesbanao.portal.billing.dto.InvoiceResponse;
import com.notesbanao.portal.billing.dto.InvoiceSeller;
import com.notesbanao.portal.billing.dto.PackagesResponse;
import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.config.PortalProperties;
import com.notesbanao.portal.store.DemoDataStore;
import com.notesbanao.portal.wallet.dto.OrderDto;

/** Pricing configuration and invoices. */
@Service
public class BillingService {

    private final DemoDataStore store;
    private final PortalProperties properties;

    public BillingService(DemoDataStore store, PortalProperties properties) {
        this.store = store;
        this.properties = properties;
    }

    public BillingConfigResponse config() {
        return new BillingConfigResponse(true, store.ruleSets(), store.durationRules(), store.referralReward());
    }

    public PackagesResponse packages() {
        return new PackagesResponse(true, store.packages(), store.gateways());
    }

    /**
     * Builds the invoice for a paid order.
     *
     * Prices are GST inclusive, so the taxable value is worked back out of the
     * total rather than added on top, and the tax is split evenly into CGST and
     * SGST because buyer and seller are treated as being in the same state.
     */
    public InvoiceResponse invoice(String orderId, UserDto user) {
        OrderDto order = store.order(orderId);
        if (order == null) {
            throw ApiException.notFound(
                    "No invoice exists for this payment. Buy an NB Points pack to generate one.");
        }
        if (!"paid".equals(order.status())) {
            throw ApiException.badRequest("An invoice is only issued for a completed payment.");
        }

        PortalProperties.Seller seller = properties.getSeller();
        int rateBps = seller.getGstRateBps();
        long taxablePaise = Math.round(order.amount_paise() * 10000.0 / (10000.0 + rateBps));
        long gstPaise = order.amount_paise() - taxablePaise;
        long cgstPaise = Math.round(gstPaise / 2.0);

        return new InvoiceResponse(
                true,
                "tax_invoice",
                invoiceNumber(order),
                financialYear(order.created_at()),
                new InvoiceSeller(seller.getLegalName(), seller.getGstin(), seller.getAddress(),
                        seller.getStateName(), seller.getStateCode()),
                seller.getStateName(),
                new InvoiceBuyer(user.email(), user.phone_e164() == null ? "" : user.phone_e164()),
                "NB Points recharge",
                "998434",
                order.currency(),
                order.amount_paise(),
                taxablePaise,
                cgstPaise,
                gstPaise - cgstPaise,
                0,
                rateBps,
                false,
                order.created_at(),
                order.id());
    }

    private String invoiceNumber(OrderDto order) {
        String tail = order.id().length() <= 6 ? order.id() : order.id().substring(order.id().length() - 6);
        int year = ZonedDateTime.ofInstant(Instant.parse(order.created_at()), ZoneOffset.UTC).getYear();
        return "DEMO/" + year + "/" + tail.toUpperCase(Locale.ROOT);
    }

    /** The Indian financial year runs April to March. */
    private String financialYear(String createdAt) {
        ZonedDateTime moment = ZonedDateTime.ofInstant(Instant.parse(createdAt), ZoneOffset.UTC);
        int start = moment.getMonthValue() >= 4 ? moment.getYear() : moment.getYear() - 1;
        return start + "-" + String.format("%02d", (start + 1) % 100);
    }
}
