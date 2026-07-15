import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-admin-form-errors',
  imports: [CommonModule],
  templateUrl: './admin-form-errors.html',
  styleUrl: './admin-form-errors.css',
})
export class AdminFormErrors {
  @Input() control: AbstractControl | null = null;
  @Input() label = 'This field';
  @Input() serverErrors: string[] = [];

  get messages(): string[] {
    const messages = [...this.serverErrors];

    if (!this.control || (!this.control.touched && !this.control.dirty)) {
      return messages;
    }

    if (this.control.hasError('required')) {
      messages.unshift(`${this.label} is required.`);
    }

    if (this.control.hasError('email')) {
      messages.unshift('Enter a valid email address.');
    }

    if (this.control.hasError('minlength')) {
      messages.unshift(
        `${this.label} must contain at least ${this.control.getError('minlength').requiredLength} characters.`,
      );
    }

    if (this.control.hasError('maxlength')) {
      messages.unshift(
        `${this.label} cannot exceed ${this.control.getError('maxlength').requiredLength} characters.`,
      );
    }

    if (this.control.hasError('min')) {
      messages.unshift(`${this.label} must be at least ${this.control.getError('min').min}.`);
    }

    if (this.control.hasError('max')) {
      messages.unshift(`${this.label} cannot exceed ${this.control.getError('max').max}.`);
    }

    if (this.control.hasError('pattern')) {
      messages.unshift(`${this.label} has an invalid format.`);
    }

    return [...new Set(messages)];
  }
}
