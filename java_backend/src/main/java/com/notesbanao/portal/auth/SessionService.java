package com.notesbanao.portal.auth;

import com.notesbanao.portal.entity.UserEntity;
import com.notesbanao.portal.repository.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import com.notesbanao.portal.auth.dto.UserDto;
import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.config.PortalProperties;
import com.notesbanao.portal.store.DemoDataStore;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Reads and writes the session cookie, and answers "who is calling?".
 *
 * Every other feature depends on this rather than on the auth controller, which
 * is why it lives here as its own service.
 *
 * The cookie is deliberately the same name the Node demo backend uses, so the
 * front end behaves identically against either backend.
 */
@Service
public class SessionService {

    private final PortalProperties properties;
    private final DemoDataStore store;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    public SessionService(PortalProperties properties, DemoDataStore store,JwtUtil jwtUtil,UserService userService) {
        this.properties = properties;
        this.store = store;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    /** The signed-in user, or null when there is no session cookie. */
    public UserDto currentUser(HttpServletRequest request) {

        String email = extractEmailFromCookie(request);

        if (email == null) {
            return null;
        }

        UserEntity user = userService.findByEmail(email);

        if (user == null) {
            return null;
        }

        return new UserDto(
                String.valueOf(user.getId()),
                user.getEmail(),
                false,
                user.getPassword() != null && !user.getPassword().isBlank(),
                null,
                false,
                "active",
                false
        );
    }

    /** The signed-in user, or a 401 that the front end turns into a redirect. */
    public UserDto requireUser(HttpServletRequest request) {
        UserDto user = currentUser(request);
        if (user == null) {
            throw ApiException.notLoggedIn();
        }
        return user;
    }

    public void startSession(HttpServletResponse response, String email) {
        String token = jwtUtil.generateToken(email);
        write(response, token, properties.getSession().getMaxAgeSeconds());
    }

    public void endSession(HttpServletResponse response) {
        write(response, "", 0);
    }

    private void write(HttpServletResponse response, String value, int maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(properties.getSession().getCookieName(), value)
                .httpOnly(true)
                .secure(properties.getSession().isSecure())
                .path("/")
                // Lax is enough because the front end and this service share a
                // hostname during development, so the calls are same-site.
                .sameSite("Lax")
                .maxAge(maxAgeSeconds)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
//its not verifying any signature,just checks cookie existance and cookie is not empty
//    private boolean hasSessionCookie(HttpServletRequest request) {
//        Cookie[] cookies = request.getCookies();
//        if (cookies == null) {
//            return false;
//        }
//        String name = properties.getSession().getCookieName();
//        for (Cookie cookie : cookies) {
//            if (name.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
//                return true;
//            }
//        }
//        return false;
//    }
//}


    private String extractEmailFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        String name = properties.getSession().getCookieName();
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                return jwtUtil.validateAndGetEmail(cookie.getValue());
            }
        }
        return null;
    }
}
