package com.notesbanao.portal.common;

/** The body of every failed request. */
public record ErrorResponse(boolean ok, String message, UserMessage userMessage) {

    public static ErrorResponse of(String message, UserMessage userMessage) {
        return new ErrorResponse(false, message, userMessage);
    }
}
