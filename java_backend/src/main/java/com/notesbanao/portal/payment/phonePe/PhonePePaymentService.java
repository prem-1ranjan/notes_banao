package com.notesbanao.portal.payment.phonePe;

import java.util.UUID;

import com.notesbanao.portal.payment.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.notesbanao.portal.auth.dto.UserDto;
import com.notesbanao.portal.billing.dto.PointPackageDto;
import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.store.DemoDataStore;

import com.phonepe.sdk.pg.common.models.response.OrderStatusResponse;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import com.phonepe.sdk.pg.payments.v2.models.request.StandardCheckoutPayRequest;
import com.phonepe.sdk.pg.payments.v2.models.response.StandardCheckoutPayResponse;

import org.springframework.transaction.annotation.Transactional;
import com.notesbanao.portal.repository.UserService;
import com.notesbanao.portal.wallet.dto.ActivityDto;

@Service("phonepe")
public class PhonePePaymentService implements PaymentGateway {

    private final StandardCheckoutClient phonePeClient;
    private final DemoDataStore store;
    private final PaymentRepository paymentRepository;
    private final UserService userService;

    @Value("${phonepe.redirect-url:http://localhost:3000/payment/result}")
    private String redirectUrl;

    public PhonePePaymentService(
            StandardCheckoutClient phonePeClient,
            DemoDataStore store, PaymentRepository paymentRepository,
            UserService userService) {

        this.phonePeClient = phonePeClient;
        this.store = store;
        this.paymentRepository = paymentRepository;
        this.userService=userService;
    }
    @Override
    public PaymentResponse createPayment(
            PaymentRequest request,
            UserDto user) {

        // 1. Check selected NB Points package
        PointPackageDto pack = store.packageByCode(
                request == null ? null : request.packageCode()
        );

        if (pack == null) {
            throw ApiException.badRequest("Pick an NB Points pack.");
        }

        // 2. Create a unique order ID
        String merchantOrderId =
                "NB_" + user.id() + "_" + UUID.randomUUID();

        // 3. Price is already stored in paise
        long amount = pack.price_paise();

        // 4. Create PhonePe checkout request
        StandardCheckoutPayRequest payRequest =
                StandardCheckoutPayRequest.builder()
                        .merchantOrderId(merchantOrderId)
                        .amount(amount)
                        .redirectUrl(redirectUrl + "?merchantOrderId=" + merchantOrderId)
                        .build();

        try {
            // 5. Send payment request to PhonePe
            StandardCheckoutPayResponse payResponse =
                    phonePeClient.pay(payRequest);

            PaymentEntity payment = new PaymentEntity();

            payment.setMerchantOrderId(merchantOrderId);
            payment.setUserId(Long.valueOf(user.id()));
            payment.setPackageCode(pack.code());
            payment.setAmountPaise(amount);
            payment.setTotalPoints(pack.total_points());
            payment.setStatus("CREATED");
            payment.setPointsCredited(false);

            paymentRepository.save(payment);

            return new PaymentResponse(
                    true,
                    merchantOrderId,
                    payResponse.getRedirectUrl()
            );

        } catch (Exception e) {
            throw new RuntimeException(
                    "PhonePe payment creation failed: " + e.getMessage(),
                    e
            );
        }
    }
    @Override
    @Transactional
    public PaymentStatusResponse checkPaymentStatus(
            String merchantOrderId,
            UserDto user) {

        if (merchantOrderId == null || merchantOrderId.isBlank()) {
            throw ApiException.badRequest("Payment order ID is missing.");
        }

        String expectedPrefix = "NB_" + user.id() + "_";

        if (!merchantOrderId.startsWith(expectedPrefix)) {
            throw ApiException.badRequest("Invalid payment order.");
        }

        try {
            // 1. PhonePe se latest payment status lo
            OrderStatusResponse orderStatusResponse =
                    phonePeClient.getOrderStatus(merchantOrderId);

            String state = orderStatusResponse.getState();

            // 2. Apne database me payment record find karo
            PaymentEntity payment =
                    paymentRepository
                            .findByMerchantOrderId(merchantOrderId)
                            .orElseThrow(() ->
                                    ApiException.badRequest(
                                            "Payment record not found."
                                    ));

            // 3. Extra security: payment isi logged-in user ka hai
            if (!payment.getUserId().equals(Long.valueOf(user.id()))) {
                throw ApiException.badRequest("Invalid payment order.");
            }

            // 4. Agar payment COMPLETED hai
            if ("COMPLETED".equals(state)) {

                int updated =
                        paymentRepository
                                .markPointsCredited(merchantOrderId);

                if (updated == 1) {

                    userService.addPoints(
                            Long.valueOf(user.id()),
                            payment.getTotalPoints()
                    );
                    store.addActivity(
                            new ActivityDto(
                                    null,
                                    "payment",
                                    "recharge",
                                    "nb_points",
                                    payment.getAmountPaise(),
                                    payment.getTotalPoints(),
                                    0,
                                    payment.getTotalPoints(),
                                    payment.getTotalPoints(),
                                    null,
                                    null,
                                    "INR",
                                    "COMPLETED",
                                    "phonepe",
                                    merchantOrderId,
                                    null,
                                    merchantOrderId,
                                    null,
                                    null,
                                    null
                            )
                    );
                }

            } else {
                payment.setStatus(state);
                paymentRepository.save(payment);
            }

            return new PaymentStatusResponse(
                    true,
                    merchantOrderId,
                    state,
                    "Payment status fetched successfully."
            );

        } catch (Exception e) {
            throw new RuntimeException(
                    "PhonePe payment status check failed: "
                            + e.getMessage(),
                    e
            );
        }
    }
}