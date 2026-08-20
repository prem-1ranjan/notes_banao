package com.notesbanao.portal.wallet;

import org.springframework.web.bind.annotation.RestController;

import com.notesbanao.portal.auth.SessionService;
import com.notesbanao.portal.wallet.dto.CouponRedeemResponse;
import com.notesbanao.portal.wallet.dto.CouponRequest;
import com.notesbanao.portal.wallet.dto.CouponValidateResponse;
import com.notesbanao.portal.wallet.dto.RechargeRequest;
import com.notesbanao.portal.wallet.dto.RechargeResponse;
import com.notesbanao.portal.wallet.dto.WalletOverviewResponse;

import jakarta.servlet.http.HttpServletRequest;

/** Every wallet endpoint needs a session, so each method checks for one first. */
@RestController
public class WalletController implements WalletApi {

    private final WalletService walletService;
    private final SessionService sessionService;

    public WalletController(WalletService walletService, SessionService sessionService) {
        this.walletService = walletService;
        this.sessionService = sessionService;
    }

    @Override
    public WalletOverviewResponse overview(int page, int limit, HttpServletRequest request) {
        sessionService.requireUser(request);
        return walletService.overview(page, limit);
    }

    @Override
    public RechargeResponse recharge(RechargeRequest request, HttpServletRequest http) {
        sessionService.requireUser(http);
        return walletService.recharge(request);
    }

    @Override
    public CouponValidateResponse validateCoupon(CouponRequest request, HttpServletRequest http) {
        sessionService.requireUser(http);
        return walletService.validate(request);
    }

    @Override
    public CouponRedeemResponse redeemCoupon(CouponRequest request, HttpServletRequest http) {
        sessionService.requireUser(http);
        return new CouponRedeemResponse(true, walletService.redeem(request));
    }
}
