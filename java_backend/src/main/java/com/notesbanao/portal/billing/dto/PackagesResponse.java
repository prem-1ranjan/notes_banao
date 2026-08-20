package com.notesbanao.portal.billing.dto;

import java.util.List;

public record PackagesResponse(boolean ok, List<PointPackageDto> packages,
        List<PaymentGatewayDto> payment_gateways) {
}
