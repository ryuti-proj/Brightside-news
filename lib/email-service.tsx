"use client"

export interface EmailTemplate {
  subject: string
  htmlBody: string
  textBody: string
}

export interface EmailHistory {
  id: string
  to: string
  subject: string
  type: "welcome" | "password_change" | "preferences_update" | "login_alert" | "security"
  sentAt: string
  status: "sent" | "failed"
  htmlBody: string
  textBody: string
}

class EmailService {
  private static instance: EmailService
  private emailHistory: EmailHistory[] = []

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("brightside-email-history")
      if (stored) {
        try {
          this.emailHistory = JSON.parse(stored)
        } catch (error) {
          console.error("Failed to load email history:", error)
          this.emailHistory = []
        }
      }
    }
  }

  private saveHistory() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("brightside-email-history", JSON.stringify(this.emailHistory))
      } catch (error) {
        console.error("Failed to save email history:", error)
      }
    }
  }

  private createWelcomeTemplate(name: string, email: string): EmailTemplate {
    return {
      subject: "Welcome to BrightSide News! 🌟",
      htmlBody: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to BrightSide News!</h1>
              </div>
              <div class="content">
                <h2>Hi ${name},</h2>
                <p>Thank you for joining BrightSide News! We're thrilled to have you as part of our community dedicated to spreading positivity and good news.</p>
                <p>Here's what you can do now:</p>
                <ul>
                  <li>Browse uplifting stories from around the world</li>
                  <li>Save your favorite articles to read later</li>
                  <li>Customize your news feed preferences</li>
                  <li>Track your mood and see how positive news affects you</li>
                  <li>Earn badges for engaging with our community</li>
                </ul>
                <a href="http://localhost:3000" class="button">Start Reading Positive News</a>
                <p>If you have any questions, feel free to reach out to our support team.</p>
                <p>Stay positive!</p>
                <p><strong>The BrightSide News Team</strong></p>
              </div>
              <div class="footer">
                <p>You received this email because you created an account at BrightSide News</p>
                <p>BrightSide News - Bringing Positivity to Your Day</p>
              </div>
            </div>
          </body>
        </html>
      `,
      textBody: `
Welcome to BrightSide News!

Hi ${name},

Thank you for joining BrightSide News! We're thrilled to have you as part of our community dedicated to spreading positivity and good news.

Here's what you can do now:
- Browse uplifting stories from around the world
- Save your favorite articles to read later
- Customize your news feed preferences
- Track your mood and see how positive news affects you
- Earn badges for engaging with our community

Visit http://localhost:3000 to start reading positive news!

If you have any questions, feel free to reach out to our support team.

Stay positive!
The BrightSide News Team

You received this email because you created an account at BrightSide News
      `,
    }
  }

  private createPasswordChangeTemplate(name: string): EmailTemplate {
    return {
      subject: "Password Changed Successfully 🔒",
      htmlBody: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Changed</h1>
              </div>
              <div class="content">
                <h2>Hi ${name},</h2>
                <p>Your BrightSide News account password was successfully changed at ${new Date().toLocaleString()}.</p>
                <div class="alert">
                  <strong>Security Tip:</strong> If you did not make this change, please contact our support team immediately.
                </div>
                <p><strong>Password Security Tips:</strong></p>
                <ul>
                  <li>Use a unique password for each account</li>
                  <li>Make your password at least 12 characters long</li>
                  <li>Include numbers, symbols, and mixed case letters</li>
                  <li>Don't share your password with anyone</li>
                  <li>Consider using a password manager</li>
                </ul>
                <p>Stay safe!</p>
                <p><strong>The BrightSide News Security Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated security notification from BrightSide News</p>
              </div>
            </div>
          </body>
        </html>
      `,
      textBody: `
Password Changed Successfully

Hi ${name},

Your BrightSide News account password was successfully changed at ${new Date().toLocaleString()}.

Security Tip: If you did not make this change, please contact our support team immediately.

Password Security Tips:
- Use a unique password for each account
- Make your password at least 12 characters long
- Include numbers, symbols, and mixed case letters
- Don't share your password with anyone
- Consider using a password manager

Stay safe!
The BrightSide News Security Team

This is an automated security notification from BrightSide News
      `,
    }
  }

  private createPreferencesUpdateTemplate(name: string, changes: string[]): EmailTemplate {
    const changesList = changes.map((change) => `<li>${change}</li>`).join("")
    const changesText = changes.map((change) => `- ${change}`).join("\n")

    return {
      subject: "Feed Preferences Updated ✅",
      htmlBody: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .changes { background: white; border: 1px solid #e5e7eb; border-radius: 5px; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Preferences Updated</h1>
              </div>
              <div class="content">
                <h2>Hi ${name},</h2>
                <p>Your BrightSide News feed preferences have been successfully updated.</p>
                <div class="changes">
                  <h3>Changes Made:</h3>
                  <ul>${changesList}</ul>
                </div>
                <p>Your personalized news feed will now reflect these preferences, bringing you more of the positive stories you love!</p>
                <p>You can always update your preferences from your user dashboard.</p>
                <p><strong>The BrightSide News Team</strong></p>
              </div>
              <div class="footer">
                <p>Notification from BrightSide News</p>
              </div>
            </div>
          </body>
        </html>
      `,
      textBody: `
Feed Preferences Updated

Hi ${name},

Your BrightSide News feed preferences have been successfully updated.

Changes Made:
${changesText}

Your personalized news feed will now reflect these preferences, bringing you more of the positive stories you love!

You can always update your preferences from your user dashboard.

The BrightSide News Team

Notification from BrightSide News
      `,
    }
  }

  private createLoginAlertTemplate(name: string, device: string, location: string): EmailTemplate {
    return {
      subject: "New Login to Your Account 🔐",
      htmlBody: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .info { background: white; border: 1px solid #e5e7eb; border-radius: 5px; padding: 15px; margin: 20px 0; }
              .warning { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Login Detected</h1>
              </div>
              <div class="content">
                <h2>Hi ${name},</h2>
                <p>We detected a new login to your BrightSide News account.</p>
                <div class="info">
                  <h3>Login Details:</h3>
                  <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                  <p><strong>Device:</strong> ${device}</p>
                  <p><strong>Location:</strong> ${location}</p>
                </div>
                <p>If this was you, no action is needed.</p>
                <div class="warning">
                  <strong>Wasn't you?</strong> Please secure your account immediately by changing your password and reviewing your account settings.
                </div>
                <p><strong>The BrightSide News Security Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated security notification from BrightSide News</p>
              </div>
            </div>
          </body>
        </html>
      `,
      textBody: `
New Login Detected

Hi ${name},

We detected a new login to your BrightSide News account.

Login Details:
- Time: ${new Date().toLocaleString()}
- Device: ${device}
- Location: ${location}

If this was you, no action is needed.

Wasn't you? Please secure your account immediately by changing your password and reviewing your account settings.

The BrightSide News Security Team

This is an automated security notification from BrightSide News
      `,
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const template = this.createWelcomeTemplate(name, email)
    return this.sendEmail(email, template, "welcome")
  }

  async sendPasswordChangeEmail(email: string, name: string): Promise<boolean> {
    const template = this.createPasswordChangeTemplate(name)
    return this.sendEmail(email, template, "password_change")
  }

  async sendPreferencesUpdateEmail(email: string, name: string, changes: string[]): Promise<boolean> {
    const template = this.createPreferencesUpdateTemplate(name, changes)
    return this.sendEmail(email, template, "preferences_update")
  }

  async sendLoginAlertEmail(email: string, name: string, device: string, location: string): Promise<boolean> {
    const template = this.createLoginAlertTemplate(name, device, location)
    return this.sendEmail(email, template, "login_alert")
  }

  private async sendEmail(
    to: string,
    template: EmailTemplate,
    type: "welcome" | "password_change" | "preferences_update" | "login_alert" | "security",
  ): Promise<boolean> {
    try {
      // Simulate email sending (in production, integrate with SendGrid, AWS SES, etc.)
      await this.simulateEmailSend()

      // Store in history
      const emailRecord: EmailHistory = {
        id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        to,
        subject: template.subject,
        type,
        sentAt: new Date().toISOString(),
        status: "sent",
        htmlBody: template.htmlBody,
        textBody: template.textBody,
      }

      this.emailHistory.unshift(emailRecord)

      // Keep only last 50 emails
      if (this.emailHistory.length > 50) {
        this.emailHistory = this.emailHistory.slice(0, 50)
      }

      this.saveHistory()

      console.log(`[EmailService] Sent ${type} email to ${to}`)
      return true
    } catch (error) {
      console.error(`[EmailService] Failed to send ${type} email:`, error)
      return false
    }
  }

  private async simulateEmailSend(): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simulate 95% success rate
    if (Math.random() < 0.05) {
      throw new Error("Email send failed (simulated)")
    }
  }

  getEmailHistory(): EmailHistory[] {
    return [...this.emailHistory]
  }

  getEmailById(id: string): EmailHistory | undefined {
    return this.emailHistory.find((email) => email.id === id)
  }

  clearEmailHistory(): void {
    this.emailHistory = []
    this.saveHistory()
  }

  getEmailStats(): {
    total: number
    byType: Record<string, number>
    successRate: number
  } {
    const total = this.emailHistory.length
    const byType: Record<string, number> = {}
    let successful = 0

    this.emailHistory.forEach((email) => {
      byType[email.type] = (byType[email.type] || 0) + 1
      if (email.status === "sent") {
        successful++
      }
    })

    return {
      total,
      byType,
      successRate: total > 0 ? (successful / total) * 100 : 100,
    }
  }
}

export const emailService = EmailService.getInstance()
