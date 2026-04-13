package org.example.backend.dto;

public class TodoDto {
    private int id;
    private String todo;
    private boolean done;

    public TodoDto(int id, String todo, boolean done) {
        this.id = id;
        this.todo = todo;
        this.done = done;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTodo() {
        return todo;
    }

    public void setTodo(String todo) {
        this.todo = todo;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }
}
