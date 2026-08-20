package com.notesbanao.portal.common;

import java.util.List;

/** Slices an in-memory list the way a paged query would. */
public final class Paging {

    private Paging() {
    }

    public static <T> List<T> slice(List<T> items, PageMeta meta) {
        int from = Math.min((meta.page() - 1) * meta.pageSize(), items.size());
        int to = Math.min(from + meta.pageSize(), items.size());
        return items.subList(from, to);
    }

    /** Keeps a caller-supplied page size inside sensible bounds. */
    public static int limit(int requested, int fallback, int max) {
        int value = requested > 0 ? requested : fallback;
        return Math.min(value, max);
    }
}
