package com.notesbanao.portal.common;

/**
 * The pagination envelope every list endpoint returns.
 */
public record PageMeta(int page, int pageSize, int total, int totalPages) {

    /** Clamps the requested page into range and works out how many there are. */
    public static PageMeta of(int page, int pageSize, int total) {
        int totalPages = Math.max(1, (int) Math.ceil(total / (double) pageSize));
        return new PageMeta(Math.min(Math.max(1, page), totalPages), pageSize, total, totalPages);
    }
}
