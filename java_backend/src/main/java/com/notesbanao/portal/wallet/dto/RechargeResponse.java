package com.notesbanao.portal.wallet.dto;

import java.util.List;

import com.notesbanao.portal.common.PageMeta;

/**
 * Three replies are legal and the front end handles all of them.
 *
 * Set payment_url to send the browser to a gateway. Return a razorpay_checkout
 * block to open an in-page checkout. Or, as here, settle the order immediately
 * and return the refreshed wallet so the modal can show its receipt.
 */
public record RechargeResponse(
        boolean ok,
        OrderDto order,
        WalletDto wallet,
        List<ActivityDto> activities,
        PageMeta pagination,
        String payment_url) {

    public static RechargeResponse settled(OrderDto order, WalletDto wallet, List<ActivityDto> activities,
            PageMeta pagination) {
        return new RechargeResponse(true, order, wallet, activities, pagination, null);
    }
}
