package org.example.backend.service;

import org.example.backend.dto.TodoDto;
import java.util.List;

/**
 * Business Layer - TodoService Interface
 * Defines operations for managing todos.
 */
public interface TodoService {
    TodoDto create(TodoDto todo);
    TodoDto getById(int id);
    List<TodoDto> getAll();
    TodoDto update(int id, TodoDto todo);
    void delete(int id);
}
