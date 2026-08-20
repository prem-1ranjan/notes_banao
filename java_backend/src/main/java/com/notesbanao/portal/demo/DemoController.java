package com.notesbanao.portal.demo;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;

import com.notesbanao.portal.common.ApiException;
import com.notesbanao.portal.common.SimpleResponse;
import com.notesbanao.portal.config.PortalProperties;
import com.notesbanao.portal.store.DemoDataStore;

@RestController
public class DemoController implements DemoApi {

    private final DemoDataStore store;
    private final PortalProperties properties;

    public DemoController(DemoDataStore store, PortalProperties properties) {
        this.store = store;
        this.properties = properties;
    }

    @Override
    public SimpleResponse reset() {
        if (!properties.getDemo().isResetEndpointEnabled()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Not found.");
        }
        store.reset();
        return SimpleResponse.success("Sample data reset from src/main/resources/seed.");
    }
}
