package com.notesbanao.portal.account.dto;

/** request is null when nothing is pending. */
public record DeletionStateResponse(boolean ok, boolean pending, DeletionRequestDto request) {
}
