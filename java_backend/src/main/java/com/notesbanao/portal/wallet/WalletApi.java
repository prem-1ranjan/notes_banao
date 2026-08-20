package com.notesbanao.portal.wallet;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.notesbanao.portal.wallet.dto.CouponRedeemResponse;
import com.notesbanao.portal.wallet.dto.CouponRequest;
import com.notesbanao.portal.wallet.dto.CouponValidateResponse;
import com.notesbanao.portal.wallet.dto.RechargeRequest;
import com.notesbanao.portal.wallet.dto.RechargeResponse;
import com.notesbanao.portal.wallet.dto.WalletOverviewResponse;

import jakarta.servlet.http.HttpServletRequest;

/**
 * The NB Points wallet: balance, history, recharges and coupons.
 *
 * Money is always in paise, and NB Points are always whole numbers.
 */
@RequestMapping("/api/wallet")
public interface WalletApi {

    /** Balance plus one page of activity, newest first. */
    @GetMapping("/overview")
    WalletOverviewResponse overview(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            HttpServletRequest request);

    @PostMapping("/recharge")
    RechargeResponse recharge(@RequestBody RechargeRequest request, HttpServletRequest http);

    /** Preview what a coupon would do. Nothing is claimed here. */
    @PostMapping("/coupon/validate")
    CouponValidateResponse validateCoupon(@RequestBody CouponRequest request, HttpServletRequest http);

    /** Claim a free-points coupon. Percentage coupons are applied at recharge. */
    @PostMapping("/coupon/redeem")
    CouponRedeemResponse redeemCoupon(@RequestBody CouponRequest request, HttpServletRequest http);
}
