import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-messages',
  imports: [],
  templateUrl: './toast-messages.component.html',
  styleUrl: './toast-messages.component.scss',
})
export class ToastMessages {
  constructor(public toast: ToastService) {
    
  }
}
