package com.notesbanao.portal.common;

/**
 * A notice meant for the person using the portal, attached to a failure when a
 * bare sentence is not enough.
 *
 * severity is one of info, success or attention.
 * action is one of none, sign_in, recharge, retry or open_dashboard, and the
 * front end turns it into a button.
 */
public record UserMessage(String title, String message, String severity, String action) {
}
