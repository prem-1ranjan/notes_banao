package com.notesbanao.portal.referral;

import com.notesbanao.portal.referral.dto.ReferralInfoResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/referrals")
public class ReferralController {
    private final ReferralService referralService;

    public ReferralController(ReferralService referralService){
        this.referralService = referralService;
    }

    @GetMapping("/info")
    public ReferralInfoResponse getReferralInfo(@RequestParam("token") String token){
        String referrerEmail = referralService.getReferrerEmail(token);
        return new ReferralInfoResponse(true, referrerEmail);
    }
}
