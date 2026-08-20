package com.notesbanao.portal.common;

/**
 * The plain success reply, used where an endpoint has nothing to return but
 * needs to say it worked.
 *
 * The factory methods are named success rather than ok because a no-argument
 * ok() would collide with the accessor generated for the ok component.
 */
public record SimpleResponse(boolean ok, String message) {

    public static SimpleResponse success() {
        return new SimpleResponse(true, null);
    }

    public static SimpleResponse success(String message) {
        return new SimpleResponse(true, message);
    }
}
