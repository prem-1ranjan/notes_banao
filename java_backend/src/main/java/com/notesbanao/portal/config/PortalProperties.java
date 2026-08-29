package com.notesbanao.portal.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Everything in application.yml under the portal key.
 *
 * Any of these can also be set with an environment variable, which is how you
 * would configure a deployed instance, e.g. PORTAL_CORS_ALLOWEDORIGINS.
 */
@ConfigurationProperties(prefix = "portal")
public class PortalProperties {

    private Cors cors = new Cors();
    private Session session = new Session();
    private Demo demo = new Demo();
    private Seller seller = new Seller();
    private Jwt jwt = new Jwt();
    public Jwt getJwt() {
        return jwt;
    }

    public void setJwt(Jwt jwt) {
        this.jwt = jwt;
    }

    public Cors getCors() {
        return cors;
    }

    public void setCors(Cors cors) {
        this.cors = cors;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public Demo getDemo() {
        return demo;
    }

    public void setDemo(Demo demo) {
        this.demo = demo;
    }

    public Seller getSeller() {
        return seller;
    }

    public void setSeller(Seller seller) {
        this.seller = seller;
    }


    public static class Jwt {
        /** Secret key used to sign tokens. Must be at least 256 bits (32+ characters). */
        private String secret = "change-this-to-a-long-random-secret-key-in-env";
        /** How long an access token stays valid. */
        private int expirySeconds = 60 * 60; // 1 hour

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public int getExpirySeconds() {
            return expirySeconds;
        }

        public void setExpirySeconds(int expirySeconds) {
            this.expirySeconds = expirySeconds;
        }
    }

    /** Which browser origins may call this API with cookies. */
    public static class Cors {
        /** Exact origins only. A wildcard is not allowed alongside credentials. */
        private List<String> allowedOrigins = List.of("http://127.0.0.1:3000", "http://localhost:3000");

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public static class Session {
        /** The same cookie name the Node demo backend uses, so the front end needs no change. */
        private String cookieName = "notesbanao_demo_session";
        private int maxAgeSeconds = 60 * 60 * 24 * 7;
        /** Leave false for plain http development; turn on behind HTTPS. */
        private boolean secure = false;

        public String getCookieName() {
            return cookieName;
        }

        public void setCookieName(String cookieName) {
            this.cookieName = cookieName;
        }

        public int getMaxAgeSeconds() {
            return maxAgeSeconds;
        }

        public void setMaxAgeSeconds(int maxAgeSeconds) {
            this.maxAgeSeconds = maxAgeSeconds;
        }

        public boolean isSecure() {
            return secure;
        }

        public void setSecure(boolean secure) {
            this.secure = secure;
        }
    }

    public static class Demo {
        /** The verification code this build always accepts. */
        private String otp = "123456";
        /** Whether the reset endpoint is exposed. Turn off for anything real. */
        private boolean resetEndpointEnabled = true;

        public String getOtp() {
            return otp;
        }

        public void setOtp(String otp) {
            this.otp = otp;
        }

        public boolean isResetEndpointEnabled() {
            return resetEndpointEnabled;
        }

        public void setResetEndpointEnabled(boolean resetEndpointEnabled) {
            this.resetEndpointEnabled = resetEndpointEnabled;
        }
    }

    /**
     * Who appears as the seller on a GST invoice.
     *
     * These are placeholders, exactly like lib/business-info.ts on the front
     * end. Do not put real registration details in this repository.
     */
    public static class Seller {
        private String legalName = "Demo Owner";
        private String gstin = "00AAAAA0000A1Z0";
        private String address = "1 Demo Street, Example City - 000000";
        private String stateName = "Karnataka";
        private String stateCode = "29";
        /** GST rate in basis points, so 1800 is 18 percent. */
        private int gstRateBps = 1800;

        public String getLegalName() {
            return legalName;
        }

        public void setLegalName(String legalName) {
            this.legalName = legalName;
        }

        public String getGstin() {
            return gstin;
        }

        public void setGstin(String gstin) {
            this.gstin = gstin;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public String getStateName() {
            return stateName;
        }

        public void setStateName(String stateName) {
            this.stateName = stateName;
        }

        public String getStateCode() {
            return stateCode;
        }

        public void setStateCode(String stateCode) {
            this.stateCode = stateCode;
        }

        public int getGstRateBps() {
            return gstRateBps;
        }

        public void setGstRateBps(int gstRateBps) {
            this.gstRateBps = gstRateBps;
        }
    }
}
