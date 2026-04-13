import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
    id: number;
    message: string;
    isError: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    messages = signal<ToastMessage[]>([]);
    private nextId = 0;

    show(message: string, isError: boolean = false, duration: number = 4000) {
        const id = this.nextId++;
        const toast: ToastMessage = { id, message, isError };
        
        this.messages.update(messages => [...messages, toast]);

        setTimeout(() => {
            this.remove(id);
        }, duration);
    }

    private remove(id: number) {
        this.messages.update(messages => messages.filter(msg => msg.id !== id));
    }
}