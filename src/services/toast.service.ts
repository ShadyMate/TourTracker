import { Injectable, signal, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
    message = signal<string | null>(null);
    isError = signal<boolean>(false);

    show(message: string, isError: boolean) {
        this.message.set(message);
        this.isError.set(isError);

        setTimeout(() => {
            this.message.set(null);
        }, 4000);
    }
}