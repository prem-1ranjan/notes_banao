package com.notesbanao.portal.common;

import org.springframework.http.HttpStatus;

/**
 * A failure the front end is meant to show the user.
 *
 * The API contract treats an HTTP 4xx and an ok:false body as equally valid
 * failures, and 401 or 403 specifically as "the session is gone".
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final UserMessage userMessage;

    public ApiException(HttpStatus status, String message) {
        this(status, message, null);
    }

    public ApiException(HttpStatus status, String message, UserMessage userMessage) {
        super(message);
        this.status = status;
        this.userMessage = userMessage;
    }

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    public static ApiException notLoggedIn() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "Not logged in.");
    }

    public static ApiException loginRequired() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "Login required.");
    }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, message);
    }

    /**
     * 402, carrying the notice the NB Points panel turns into a Recharge button.
     * Nothing may have been charged when this is thrown.
     */
    public static ApiException insufficientPoints(int charge, int balance) {
        String sentence = "This recording costs " + charge + " NB Points and you have " + balance + ".";
        return new ApiException(HttpStatus.PAYMENT_REQUIRED, sentence, new UserMessage(
                "Not enough NB Points",
                sentence + " Add points to generate these notes.",
                "attention",
                "recharge"));
    }

    public HttpStatus getStatus() {
        return status;
    }

    public UserMessage getUserMessage() {
        return userMessage;
    }
}
