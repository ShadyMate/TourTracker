package org.example.backend.controller;

import org.example.backend.dto.TodoDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IndexController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello world!";
    }

}
