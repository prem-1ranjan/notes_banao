package com.notesbanao.portal.common;

import java.util.concurrent.ThreadLocalRandom;

/** Short opaque identifiers, in the same shape the sample data uses. */
public final class Ids {

    private Ids() {
    }

    public static String next(String prefix) {
        return prefix + "_" + Long.toString(ThreadLocalRandom.current().nextLong(1L << 40), 36);
    }
}
