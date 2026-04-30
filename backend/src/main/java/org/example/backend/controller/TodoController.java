package org.example.backend.controller;

import org.example.backend.dto.TodoDto;
import org.example.backend.service.TodoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Presentation Layer - TodoController
 * Handles HTTP requests related to todos.
 */
@RestController
@RequestMapping("/todos")
public class TodoController {
    private static final Logger logger = LoggerFactory.getLogger(TodoController.class);
    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
        logger.info("Initializing TodoController");
    }

    @PostMapping
    public ResponseEntity<TodoDto> create(@RequestBody TodoDto todoDto) {
        logger.info("POST /todos - Creating new todo");
        try {
            TodoDto created = todoService.create(todoDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            logger.error("Error creating todo", e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TodoDto> read(@PathVariable int id) {
        logger.info("GET /todos/{} - Retrieving todo", id);
        try {
            TodoDto todo = todoService.getById(id);
            if (todo != null) {
                return ResponseEntity.ok(todo);
            } else {
                logger.warn("Todo not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error retrieving todo", e);
            throw e;
        }
    }

    @GetMapping
    public ResponseEntity<List<TodoDto>> readAll() {
        logger.info("GET /todos - Retrieving all todos");
        try {
            List<TodoDto> todos = todoService.getAll();
            return ResponseEntity.ok(todos);
        } catch (Exception e) {
            logger.error("Error retrieving all todos", e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoDto> update(@PathVariable int id, @RequestBody TodoDto todoDto) {
        logger.info("PUT /todos/{} - Updating todo", id);
        try {
            TodoDto updated = todoService.update(id, todoDto);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            } else {
                logger.warn("Todo not found for update - ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error updating todo", e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        logger.info("DELETE /todos/{} - Deleting todo", id);
        try {
            todoService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting todo", e);
            throw e;
        }
    }
}
