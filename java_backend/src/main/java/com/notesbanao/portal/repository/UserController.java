package com.notesbanao.portal.repository;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/save")
    public String saveUser(@RequestBody UserSaveRequest request) {
        userService.saveFromRequest(request);
        return "User saved successfully!";
    }
}
