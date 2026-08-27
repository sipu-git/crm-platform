export function baseEmailLayout(bodyHtml: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            background-color: #f8fafc;
            padding: 40px 0;
          }
          .container {
            max-width: 520px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
          }
          .brand-header {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            padding: 28px 32px;
            text-align: center;
          }
          .brand-name {
            color: #ffffff;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .brand-badge {
            display: inline-block;
            margin-top: 4px;
            background-color: rgba(99, 102, 241, 0.2);
            color: #818cf8;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 2px 8px;
            border-radius: 9999px;
          }
          .main-body {
            padding: 32px;
          }
          .title {
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
            margin: 0 0 16px 0;
          }
          .text {
            font-size: 15px;
            line-height: 1.6;
            color: #475569;
            margin: 0 0 20px 0;
          }
          .otp-container {
            background-color: #f1f5f9;
            border: 2px dashed #cbd5e1;
            border-radius: 10px;
            padding: 24px 16px;
            text-align: center;
            margin: 24px 0;
          }
          .otp-code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            font-size: 36px;
            font-weight: 700;
            color: #4f46e5;
            letter-spacing: 8px;
            margin: 0 0 8px 0;
          }
          .otp-expiry {
            font-size: 13px;
            color: #64748b;
            margin: 0;
          }
          .security-box {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 14px 16px;
            border-radius: 0 8px 8px 0;
            margin: 24px 0;
            font-size: 13px;
            line-height: 1.5;
            color: #991b1b;
          }
          .footer {
            padding: 24px 32px;
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.5;
          }
          .footer p {
            margin: 4px 0;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="brand-header">
              <h1 class="brand-name">ClearView</h1>
              <span class="brand-badge">CRM Platform</span>
            </div>
            <div class="main-body">
              ${bodyHtml}
            </div>
            <div class="footer">
              <p>This is an automated security message from ClearView CRM. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} ClearView CRM. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>`;
}