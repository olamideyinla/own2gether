import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/inbound-email
 *
 * Resend Inbound webhook — called whenever an email arrives at the
 * configured inbound domain (e.g. sales@updates.own2gether.com).
 *
 * Resend docs: https://resend.com/docs/dashboard/emails/inbound
 *
 * The received email is stored as a ContactMessage so it appears
 * in the admin Messages panel alongside contact-form submissions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const from: string    = body.from    ?? ''
    const subject: string = body.subject ?? '(no subject)'
    const text: string    = (body.text ?? '').trim()

    // Parse "Display Name <email@domain.com>" or bare "email@domain.com"
    const match       = from.match(/^(.+?)\s*<([^>]+)>$/)
    const senderName  = match ? match[1].trim() : from
    const senderEmail = match ? match[2].trim() : from

    await db.contactMessage.create({
      data: {
        name:    senderName || senderEmail,
        email:   senderEmail || null,
        phone:   null,
        message: `Subject: ${subject}\n\n${text}`,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[inbound-email] webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
