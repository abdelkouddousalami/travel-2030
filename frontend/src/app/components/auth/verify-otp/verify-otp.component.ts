import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.css'
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  email = '';
  otpDigits: string[] = ['', '', '', '', '', ''];
  isLoading = false;
  isResending = false;
  errorMessage = '';
  successMessage = '';

  countdown = 0;
  private countdownInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!this.email) {
      this.router.navigate(['/register']);
      return;
    }
    this.startCountdown(60);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      input.value = '';
      this.otpDigits[index] = '';
      return;
    }

    this.otpDigits[index] = value;

    // Auto-focus next input
    if (value && index < 5) {
      const inputs = this.otpInputs.toArray();
      inputs[index + 1].nativeElement.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (this.otpDigits.every(d => d !== '')) {
      this.verifyOtp();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    // Handle backspace
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const inputs = this.otpInputs.toArray();
      inputs[index - 1].nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') || '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6);

    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = digits[i] || '';
    }

    // Update input elements
    setTimeout(() => {
      const inputs = this.otpInputs.toArray();
      inputs.forEach((input, i) => {
        input.nativeElement.value = this.otpDigits[i];
      });
      // Focus the last filled or first empty
      const focusIndex = Math.min(digits.length, 5);
      inputs[focusIndex].nativeElement.focus();

      if (digits.length === 6) {
        this.verifyOtp();
      }
    });
  }

  verifyOtp(): void {
    const code = this.otpDigits.join('');
    if (code.length !== 6) {
      this.errorMessage = 'Veuillez entrer les 6 chiffres du code.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.verifyOtp({ email: this.email, code }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Email verifie avec succes ! Redirection...';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Code invalide. Veuillez reessayer.';
        // Clear inputs
        this.otpDigits = ['', '', '', '', '', ''];
        setTimeout(() => {
          const inputs = this.otpInputs.toArray();
          inputs.forEach(input => input.nativeElement.value = '');
          inputs[0].nativeElement.focus();
        });
      }
    });
  }

  resendOtp(): void {
    if (this.countdown > 0) return;

    this.isResending = true;
    this.errorMessage = '';

    this.authService.resendOtp({ email: this.email }).subscribe({
      next: (response) => {
        this.isResending = false;
        this.successMessage = response.message;
        this.startCountdown(60);
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (error) => {
        this.isResending = false;
        this.errorMessage = error.error?.message || 'Impossible de renvoyer le code.';
      }
    });
  }

  private startCountdown(seconds: number): void {
    this.countdown = seconds;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  getMaskedEmail(): string {
    if (!this.email) return '';
    const [local, domain] = this.email.split('@');
    if (local.length <= 2) return this.email;
    return local[0] + '***' + local[local.length - 1] + '@' + domain;
  }

  isOtpComplete(): boolean {
    return this.otpDigits.every(d => d !== '');
  }
}
