import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-messages',
  imports: [],
  templateUrl: './toast-messages.component.html',
  styleUrl: './toast-messages.component.scss',
})
export class ToastMessages {
  toast = inject(ToastService);
}
