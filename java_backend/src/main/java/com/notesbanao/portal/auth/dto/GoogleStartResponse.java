package com.notesbanao.portal.auth.dto;

/** The browser is sent to authUrl to continue with Google. */
public record GoogleStartResponse(boolean ok, String authUrl) {
}
