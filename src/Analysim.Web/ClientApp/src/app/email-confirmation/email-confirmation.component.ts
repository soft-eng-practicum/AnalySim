import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.scss']
})
export class EmailConfirmationComponent implements OnInit {
  
  userId: string | null = null;
  token: string | null = null;

  confirming = false;
  confirmed = false;
  error = false;
  linkInvalid = false;
  showRegister = false;

  message: string = "Loading confirmation details...";

  constructor(private route: ActivatedRoute, private http: HttpClient) {}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const uid = params['userid'];
      const tok = params['token'];

      this.userId = uid ?? null;
      this.token = tok ?? null;

      if (!this.userId || !this.token) {
        this.message = "Invalid confirmation link. Missing user id or token.";
        return;
      }

      this.message = "Click below to confirm your email.";
    });
  }

  onConfirmClick(): void {
    if (!this.userId || !this.token) {
      this.message = "Invalid confirmation link. Missing user id or token.";
      this.error = true;
      return;
    }

    this.confirming = true;
    this.error = false;

    const url = `/api/Account/ConfirmEmailPost?userID=${encodeURIComponent(this.userId)}&token=${encodeURIComponent(this.token)}`;

    this.http.post<any>(url, {}).subscribe({
      next: (res) => {
        this.confirming = false;

        const msg = res?.message ?? "Email confirmation complete.";
        this.message = msg;

        // Treat already verified as confirmed state
        if (msg.toLowerCase().includes("already")) {
          this.confirmed = true;
        } else if (res?.success) {
          this.confirmed = true;
        }
      },
      error: (err) => {
        this.confirming = false;
        this.error = true;

         // Default message
        let msg = "Account confirmation failed. Please try again later.";

        // If server returns JSON message
        const serverMsg = err?.error?.message;
        if (typeof serverMsg === "string" && serverMsg.trim().length > 0) {
          msg = serverMsg;
        }

        // If server returns 500+
        if (err?.status >= 500) {
          msg = "Something went wrong while confirming your email. Please try again later.";
        }

        this.message = msg;

        // Detect invalid link / user not found cases
        const msgLower = serverMsg.toLowerCase();

        // User does not exist
        if (msgLower.includes("not been registered")) {
          this.linkInvalid = true;
          this.showRegister = true;
          return;
        }

        // Invalid / expired token
        if (
          msgLower.includes("invalid") ||
          msgLower.includes("expired")
        ) {
          this.linkInvalid = true;
        }
      }
    });
  }
}
