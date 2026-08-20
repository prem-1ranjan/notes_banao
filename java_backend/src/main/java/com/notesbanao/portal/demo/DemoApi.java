package com.notesbanao.portal.demo;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.notesbanao.portal.common.SimpleResponse;

/**
 * Demo-only, and deliberately not part of the real API.
 *
 * It exists so the sample data can be put back after you have spent all the
 * points or deleted every note. Turn it off with portal.demo.reset-endpoint-
 * enabled=false, and do not implement it in anything real.
 */
@RequestMapping("/api/demo")
public interface DemoApi {

    @PostMapping("/reset")
    SimpleResponse reset();
}
