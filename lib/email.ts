import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'missing')
}
const FROM = process.env.FROM_EMAIL ?? 'Own2gether <notifications@own2gether.com>'
const BASE   = 'https://www.own2gether.com'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unsubscribeUrl(token: string) {
  return `${BASE}/unsubscribe?token=${token}`
}

function footer(token: string) {
  return `
    <p style="margin:32px 0 0;font-size:11px;color:#9ca3af;line-height:1.6;">
      You are receiving this because you subscribed to Own2gether updates.<br>
      <a href="${unsubscribeUrl(token)}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  `
}

function wrap(body: string, token: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr><td style="background:#142235;padding:20px 32px;">
          <span style="color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.05em;">OWN2GETHER</span>
        </td></tr>
        <tr><td style="padding:32px;">
          ${body}
          ${footer(token)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

// ─── Listing notification ──────────────────────────────────────────────────────

export async function sendListingNotification(opts: {
  to:        string
  name:      string | null
  token:     string
  listing: {
    title:      string
    location:   string
    totalRaise: number
    id:         string
  }
}) {
  const { to, name, token, listing } = opts
  const url     = `${BASE}/listings/${listing.id}`
  const raise   = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(listing.totalRaise)
  const greeting = name ? `Hi ${name},` : 'Hi,'

  const body = `
    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#142235;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.6;">
      A new property listing has just been posted on Own2gether.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#142235;">${listing.title}</p>
        <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">${listing.location}</p>
        <p style="margin:0;font-size:13px;color:#4b5563;">Target raise: <strong style="color:#142235;">${raise}</strong></p>
      </td></tr>
    </table>
    <a href="${url}" style="display:inline-block;background:#142235;color:#ffffff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:6px;text-decoration:none;">
      View listing →
    </a>
    <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
      Co-owners collectively fund 100% of the raise and own 97.5% of the property company.
      Own2gether takes 2.5% as a management stake in lieu of fees.
    </p>
  `

  return getResend().emails.send({
    from:    FROM,
    to,
    subject: `New listing: ${listing.title}`,
    html:    wrap(body, token),
  })
}

// ─── Deal notification ────────────────────────────────────────────────────────

export async function sendDealNotification(opts: {
  to:    string
  name:  string | null
  token: string
  deal: {
    title:                   string
    location:                string
    dealType:                string
    targetRaise:             number
    projectedReturnPct:      number | null
    projectedDurationMonths: number | null
    id:                      string
  }
}) {
  const { to, name, token, deal } = opts
  const url       = `${BASE}/deals/${deal.id}`
  const raise     = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(deal.targetRaise)
  const greeting  = name ? `Hi ${name},` : 'Hi,'
  const typeLabel = { rehabilitation: 'Rehabilitation', ground_up: 'Ground-up build', off_plan: 'Off-plan' }[deal.dealType] ?? deal.dealType

  const body = `
    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#142235;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.6;">
      A new development deal has been posted on Own2gether.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#2E6F5E;text-transform:uppercase;letter-spacing:0.05em;">${typeLabel}</p>
        <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#142235;">${deal.title}</p>
        <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">${deal.location}</p>
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:24px;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">Target raise</p>
            <p style="margin:2px 0 0;font-size:13px;font-weight:700;color:#142235;">${raise}</p>
          </td>
          ${deal.projectedReturnPct != null ? `
          <td style="padding-right:24px;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">Proj. return</p>
            <p style="margin:2px 0 0;font-size:13px;font-weight:700;color:#2E6F5E;">+${Number(deal.projectedReturnPct).toFixed(0)}%</p>
          </td>` : ''}
          ${deal.projectedDurationMonths != null ? `
          <td>
            <p style="margin:0;font-size:11px;color:#9ca3af;">Timeline</p>
            <p style="margin:2px 0 0;font-size:13px;font-weight:700;color:#142235;">${deal.projectedDurationMonths}mo</p>
          </td>` : ''}
        </tr></table>
      </td></tr>
    </table>
    <a href="${url}" style="display:inline-block;background:#142235;color:#ffffff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:6px;text-decoration:none;">
      View deal →
    </a>
    <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
      60% of net profits go to investors, proportional to their share of the raise.
      Minimum commitment is 15% of the target raise. Capital is returned in full first on exit.
    </p>
  `

  return getResend().emails.send({
    from:    FROM,
    to,
    subject: `New deal: ${deal.title}`,
    html:    wrap(body, token),
  })
}
