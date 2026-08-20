package com.notesbanao.portal.auth;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.notesbanao.portal.auth.dto.GoogleStartResponse;

/**
 * Google sign-in.
 *
 * The front end calls this, then sends the browser to whatever authUrl comes
 * back. Answering with a failure is legitimate when it is not configured, and
 * the login form shows the message.
 */
@RequestMapping("/api/google")
public interface GoogleApi {

    @GetMapping("/start")
    GoogleStartResponse start();
}
