package com.notesbanao.portal.payment.phonePe;

import com.phonepe.sdk.pg.Env;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PhonePeConfig {

    @Bean
    public StandardCheckoutClient phonePeClient(
            @Value("${phonepe.client-id}") String clientId,
            @Value("${phonepe.client-secret}") String clientSecret,
            @Value("${phonepe.client-version:1}") Integer clientVersion) {

        return StandardCheckoutClient.getInstance(
                clientId,
                clientSecret,
                clientVersion,
                Env.SANDBOX
        );
    }
}