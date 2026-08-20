package com.notesbanao.portal.transcript.dto;

import java.util.List;

import com.notesbanao.portal.common.PageMeta;

public record RecoverableResponse(boolean ok, List<TranscriptSessionDto> sessions, PageMeta pagination) {
}
