package org.example.backend.controller;

import org.example.backend.dto.TodoDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/todos")
public class TodoController {

    @PostMapping
    public TodoDto create() {
        return null;
    }

    @GetMapping("/{id}")
    public TodoDto read(@PathVariable int id) {
        return new TodoDto(id, "kitchen", false);
    }

    @GetMapping
    public List<TodoDto> readAll() {
        return null;
    }

    @PutMapping("/{id}")
    public TodoDto update() {
        return null;
    }

    @DeleteMapping("/{id}")
    public TodoDto delete() {
        return null;
    }
}
