package com.notesbanao.portal.wallet.dto;

import java.util.List;

import com.notesbanao.portal.common.PageMeta;

public record WalletOverviewResponse(
        boolean ok,
        WalletDto wallet,
        List<ActivityDto> activities,
        PageMeta pagination) {
}
