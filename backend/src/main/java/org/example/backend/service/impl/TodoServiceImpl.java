package org.example.backend.service.impl;

import org.example.backend.dto.TodoDto;
import org.example.backend.service.TodoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

/**
 * Business Layer Implementation - TodoService
 * Contains business logic for managing todos.
 */
@Service
public class TodoServiceImpl implements TodoService {
    private static final Logger logger = LoggerFactory.getLogger(TodoServiceImpl.class);
    
    // In-memory storage for demo purposes
    private final List<TodoDto> todos = new ArrayList<>();

    public TodoServiceImpl() {
        logger.info("Initializing TodoService");
    }

    @Override
    public TodoDto create(TodoDto todo) {
        logger.debug("Creating new todo: {}", todo.getTodo());
        if (todo.getTodo() == null || todo.getTodo().trim().isEmpty()) {
            logger.warn("Attempt to create todo with empty content");
            throw new IllegalArgumentException("Todo content cannot be empty");
        }
        todos.add(todo);
        logger.info("Todo created successfully with ID: {}", todo.getId());
        return todo;
    }

    @Override
    public TodoDto getById(int id) {
        logger.debug("Fetching todo with ID: {}", id);
        return todos.stream()
                .filter(t -> t.getId() == id)
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<TodoDto> getAll() {
        logger.debug("Fetching all todos. Count: {}", todos.size());
        return new ArrayList<>(todos);
    }

    @Override
    public TodoDto update(int id, TodoDto todo) {
        logger.debug("Updating todo with ID: {}", id);
        TodoDto existing = getById(id);
        if (existing != null) {
            existing.setTodo(todo.getTodo());
            existing.setDone(todo.isDone());
            logger.info("Todo with ID: {} updated successfully", id);
        } else {
            logger.warn("Todo with ID: {} not found for update", id);
        }
        return existing;
    }

    @Override
    public void delete(int id) {
        logger.debug("Deleting todo with ID: {}", id);
        todos.removeIf(t -> t.getId() == id);
        logger.info("Todo with ID: {} deleted successfully", id);
    }
}
