import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-error-message',
  imports: [NgIf],
  templateUrl: './error-message.html',
  styleUrl: './error-message.css'
})
export class ErrorMessage {
  @Input() title = 'Something went wrong';
  @Input() message = 'The data could not be loaded right now.';
  @Input() actionLabel = 'Try again';
  @Output() retry = new EventEmitter<void>();
}
