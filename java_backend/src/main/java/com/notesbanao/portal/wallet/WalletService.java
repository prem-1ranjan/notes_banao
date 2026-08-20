package com.notesbanao.portal.wallet;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.notesbanao.portal.billing.dto.PointPackageDto;
import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.common.Ids;
import com.notesbanao.portal.common.PageMeta;
import com.notesbanao.portal.common.Paging;
import com.notesbanao.portal.store.DemoDataStore;
import com.notesbanao.portal.wallet.dto.ActivityDto;
import com.notesbanao.portal.wallet.dto.CouponDto;
import com.notesbanao.portal.wallet.dto.CouponPreview;
import com.notesbanao.portal.wallet.dto.CouponRequest;
import com.notesbanao.portal.wallet.dto.CouponValidateResponse;
import com.notesbanao.portal.wallet.dto.OrderDto;
import com.notesbanao.portal.wallet.dto.RechargeRequest;
import com.notesbanao.portal.wallet.dto.RechargeResponse;
import com.notesbanao.portal.wallet.dto.WalletOverviewResponse;

/**
 * NB Points: reading the balance, buying more, and applying coupons.
 *
 * The recharge here settles immediately because there is no payment gateway to
 * talk to. A real implementation would create an order, hand the browser to the
 * gateway, and only credit points once the gateway confirms the payment.
 */
@Service
public class WalletService {

    private static final int MAX_PAGE_SIZE = 20;
    private static final int RECEIPT_ACTIVITY_COUNT = 5;

    private final DemoDataStore store;

    public WalletService(DemoDataStore store) {
        this.store = store;
    }

    public WalletOverviewResponse overview(int page, int limit) {
        List<ActivityDto> all = store.activities();
        PageMeta meta = PageMeta.of(page, Paging.limit(limit, 10, MAX_PAGE_SIZE), all.size());
        return new WalletOverviewResponse(true, store.wallet(), Paging.slice(all, meta), meta);
    }

    public RechargeResponse recharge(RechargeRequest request) {
        PointPackageDto pack = store.packageByCode(text(request == null ? null : request.package_code()));
        if (pack == null) {
            throw ApiException.badRequest("Pick an NB Points pack.");
        }

        long amountPaise = pack.price_paise();
        String couponCode = text(request.coupon_code()).toUpperCase();
        if (!couponCode.isEmpty()) {
            DemoDataStore.Coupon coupon = store.coupon(couponCode);
            if (coupon == null || !coupon.active()) {
                throw ApiException.badRequest("That coupon is not valid.");
            }
            if ("percent_off".equals(coupon.kind())) {
                amountPaise = discounted(pack.price_paise(), coupon.percent_off());
            }
        }

        OrderDto order = store.addOrder(new OrderDto(Ids.next("ord"), pack.code(), amountPaise, pack.currency(),
                pack.base_points(), pack.bonus_points(), pack.total_points(), "paid", Instant.now().toString()));

        store.creditPoints(pack.total_points());
        store.addActivity(new ActivityDto(null, "payment", "recharge", "recharge", amountPaise,
                pack.base_points(), pack.bonus_points(), pack.total_points(), pack.total_points(), null, null,
                pack.currency(), "paid", "demo_gateway", Ids.next("demo"), order.id(), order.id(), null, null, null));

        List<ActivityDto> all = store.activities();
        PageMeta meta = PageMeta.of(1, RECEIPT_ACTIVITY_COUNT, all.size());
        return RechargeResponse.settled(order, store.wallet(), Paging.slice(all, meta), meta);
    }

    /** Works out what a coupon would do, without claiming it. */
    public CouponValidateResponse validate(CouponRequest request) {
        String code = text(request == null ? null : request.code()).toUpperCase();
        if (code.isEmpty()) {
            throw ApiException.badRequest("Enter a coupon code.");
        }

        DemoDataStore.Coupon coupon = requireClaimable(code);
        CouponDto summary = new CouponDto(coupon.code(), coupon.kind(), coupon.description());

        if ("free_points".equals(coupon.kind())) {
            return new CouponValidateResponse(true, summary, CouponPreview.freePoints(coupon.free_points()));
        }

        PointPackageDto pack = store.packageByCode(text(request.package_code()));
        if (pack == null) {
            throw ApiException.badRequest("Pick an NB Points pack first.");
        }
        return new CouponValidateResponse(true, summary, CouponPreview.percentOff(coupon.percent_off(), pack.code(),
                pack.currency(), pack.price_paise(), discounted(pack.price_paise(), coupon.percent_off()),
                pack.total_points()));
    }

    /** Claims a free-points coupon. Percentage coupons are applied at recharge. */
    public int redeem(CouponRequest request) {
        String code = text(request == null ? null : request.code()).toUpperCase();
        DemoDataStore.Coupon coupon = requireClaimable(code);
        if (!"free_points".equals(coupon.kind())) {
            throw ApiException.badRequest(
                    "This coupon applies a discount at payment. Pick a pack and pay to use it.");
        }

        store.redeemCoupon(coupon.code());
        store.creditPoints(coupon.free_points());
        store.addActivity(new ActivityDto(null, "point", "grant", "grant", 0, null, null, null,
                coupon.free_points(), null, null, "INR", "completed", null, null, "coupon_" + coupon.code(),
                coupon.code(), null, null, null));
        return coupon.free_points();
    }

    private DemoDataStore.Coupon requireClaimable(String code) {
        DemoDataStore.Coupon coupon = store.coupon(code);
        if (coupon == null) {
            throw ApiException.badRequest("That coupon code was not recognised.");
        }
        if (!coupon.active()) {
            throw ApiException.badRequest("This coupon has expired.");
        }
        if (store.couponRedeemed(coupon.code())) {
            throw ApiException.badRequest("You have already used this coupon.");
        }
        return coupon;
    }

    private static long discounted(long pricePaise, int percentOff) {
        return Math.round(pricePaise * (1 - percentOff / 100.0));
    }

    private static String text(String raw) {
        return raw == null ? "" : raw.trim();
    }
}
