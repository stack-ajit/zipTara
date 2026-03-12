const { Resend } = require('resend');

// Initialize Resend with API Key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a password reset email using Resend API
 * @param {string} to - Recipient email address
 * @param {string} resetUrl - The password reset link
 */
const sendPasswordResetEmail = async (to, resetUrl) => {
    const year = new Date().getFullYear();

    // We use the verified domain mail.ziptara.in
    const fromAddress = 'zipTara <noreply@mail.ziptara.in>';

    const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject: 'Password Reset Request \u2013 zipTara',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your password</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.12);">

                            <!-- Header: Dark brand section -->
                            <tr>
                                <td style="background:linear-gradient(135deg,#1a1a2e 0%,#0f172a 100%);padding:36px 40px 28px;text-align:center;">
                                    <div style="display:inline-block;vertical-align:middle;margin-right:8px;position:relative;top:-2px;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                            <circle cx="12" cy="10" r="3"/>
                                        </svg>
                                    </div>
                                    <h1 style="display:inline-block;vertical-align:middle;margin:0;font-size:36px;font-weight:700;letter-spacing:0.5px;line-height:1;font-family:'Amaranth', Arial, sans-serif;">
                                        <span style="color:#ffffff;">zip</span><span style="color:#e63946;">Tara</span>
                                    </h1>
                                    <p style="margin:16px 0 0;color:rgba(255,255,255,0.5);font-size:13px;font-style:italic;letter-spacing:0.5px;">
                                        Safar hai, To zipTara hai.
                                    </p>
                                </td>
                            </tr>

                            <!-- Accent stripe -->
                            <tr>
                                <td style="height:4px;background:linear-gradient(90deg,#e63946,#f4a261,#e63946);"></td>
                            </tr>

                            <!-- Body: White card -->
                            <tr>
                                <td style="background:#ffffff;padding:44px 48px 36px;">
                                    <h2 style="color:#1a1a2e;margin:0 0 14px;font-size:24px;font-weight:800;">Reset Your Password</h2>
                                    <p style="color:#555555;font-size:15px;line-height:1.8;margin:0 0 28px;">
                                        We received a request to reset the password for your
                                        <strong style="color:#1a1a2e;">zipTara</strong> account.
                                        Click the button below to set a new password.
                                        This link will expire in <strong style="color:#e63946;">10 minutes</strong>.
                                    </p>

                                    <!-- CTA Button -->
                                    <div style="text-align:center;margin:0 0 36px;">
                                        <a href="${resetUrl}"
                                           style="display:inline-block;background:linear-gradient(135deg,#e63946,#f4a261);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:0.5px;box-shadow:0 6px 18px rgba(230,57,70,0.35);">
                                            Reset Password &rarr;
                                        </a>
                                    </div>

                                    <!-- Divider -->
                                    <hr style="border:none;border-top:1px solid #eeeeee;margin:0 0 24px;">

                                    <p style="color:#999999;font-size:13px;line-height:1.7;margin:0;">
                                        If you didn't request a password reset, you can safely ignore this email, your account is still secure.
                                        <br><br>
                                        Or copy and paste this link into your browser:<br>
                                        <a href="${resetUrl}" style="color:#e63946;word-break:break-all;font-size:12px;">${resetUrl}</a>
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer: Light gray, clearly visible -->
                            <tr>
                                <td style="background:#f8f9fb;padding:26px 40px;text-align:center;border-top:1px solid #e8eaf0;">
                                    <p style="margin:0 0 4px;font-size:16px;font-weight:800;">
                                        <span style="color:#1a1a2e;">zip</span><span style="color:#e63946;">Tara</span>
                                    </p>
                                    <p style="margin:0 0 10px;color:#777777;font-size:12px;font-style:italic;">
                                        Safar hai, To zipTara hai.
                                    </p>
                                    <p style="margin:0;color:#aaaaaa;font-size:11px;">
                                        &copy; ${year} zipTara &nbsp;&middot;&nbsp;
                                        <a href="https://ziptara.in" style="color:#e63946;text-decoration:none;">ziptara.in</a>
                                    </p>
                                </td>
                            </tr>

                        </table>

                        <!-- Below-card note -->
                        <p style="color:#bbbbbb;font-size:11px;text-align:center;margin:16px 0 0;padding:0 20px;">
                            This email was sent to <strong style="color:#888;">${to}</strong>.
                            Questions? Contact us at
                            <a href="mailto:support@ziptara.in" style="color:#e63946;text-decoration:none;">support@ziptara.in</a>
                        </p>

                    </td>
                </tr>
            </table>
        </body>
        </html>
        `
    });

    if (error) {
        console.error('Resend API Error:', error);
        throw new Error('Failed to send email via Resend');
    }

    console.log('Email sent successfully via Resend:', data.id);
};

module.exports = { sendPasswordResetEmail };
