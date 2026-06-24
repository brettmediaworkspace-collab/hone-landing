export function confirmationEmail(firstName: string, goal: string): string {
  const displayName = firstName ? firstName : 'there'
  const goalMap: Record<string, string> = {
    'Sharper Focus': 'FOCUS',
    'Better Memory': 'MEMORY',
    'Faster Reactions': 'SPEED',
    'All-round Performance': 'all 6 muscle groups',
  }
  const muscleGroup = goalMap[goal] || 'all 6 muscle groups'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're on the HONE waitlist.</title>
</head>
<body style="margin:0;padding:0;background-color:#0A0A0F;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0F;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-size:22px;font-weight:900;letter-spacing:0.15em;color:#ffffff;">
                H<span style="color:#B8F53C;">O</span>NE
              </span>
            </td>
          </tr>

          <!-- Hero block -->
          <tr>
            <td style="background-color:#13131A;border:1px solid #1E1E2A;border-radius:16px;padding:36px 32px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#B8F53C;">
                Assessment queued
              </p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;line-height:1.2;color:#ffffff;">
                Hey ${displayName} — you're on the list.
              </h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6);">
                HONE is the first cognitive fitness app built like a gym program — 7 minutes a day, 6 muscle groups, one score to beat.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6);">
                Based on your goal, we've flagged <strong style="color:#ffffff;">${muscleGroup}</strong> as your primary training focus. Your personalised split will be ready when we launch.
              </p>

              <!-- Score preview -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0F;border:1px solid #1E1E2A;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.3);">
                      Your baseline score
                    </p>
                    <p style="margin:0;font-size:36px;font-weight:800;font-family:'Courier New',monospace;color:#B8F53C;">
                      ???
                    </p>
                    <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.3);">
                      Unlocks on day one
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.4);">
                We'll be in touch when early access opens. In the meantime — sharpen daily.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="height:24px;"></td></tr>

          <!-- What to expect -->
          <tr>
            <td style="padding:0 0 32px;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.3);">
                What happens next
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
                  ['01', 'Early access invite', 'You\'ll be among the first to get access when HONE launches.'],
                  ['02', 'Baseline assessment', 'A 7-minute diagnostic across all 6 cognitive muscle groups.'],
                  ['03', 'Your HONE Score', 'Your starting number. The one you\'ll spend 90 days beating.'],
                ].map(([num, title, desc]) => `
                <tr>
                  <td style="padding:0 0 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top" style="padding-top:2px;">
                          <span style="font-size:11px;font-weight:700;font-family:'Courier New',monospace;color:#B8F53C;">${num}</span>
                        </td>
                        <td>
                          <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#ffffff;">${title}</p>
                          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.4);line-height:1.5;">${desc}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join('')}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #1E1E2A;padding-top:24px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);line-height:1.6;">
                You're receiving this because you joined the HONE waitlist at
                <a href="https://hone.appsplosh.com" style="color:rgba(255,255,255,0.3);">hone.appsplosh.com</a>.
                <br />© 2026 HONE · honeyourmind.app
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
