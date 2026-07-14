import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/admin/blob?docId=xxx&field=id|proof
 *
 * Authenticated admin-only proxy that fetches a KYC document blob and streams
 * it back to the browser.  The actual Vercel Blob URL is NEVER sent to the
 * client — only the binary content is proxied through this route.
 *
 * Auth: checks the admin_session cookie against ADMIN_PASSWORD (same mechanism
 * as the admin dashboard middleware).
 */
export async function GET(request: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  const session       = request.cookies.get('admin_session')?.value
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword || !session || session !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Params ───────────────────────────────────────────────────────────────────
  const { searchParams } = request.nextUrl
  const docId = searchParams.get('docId')
  const field = searchParams.get('field')

  if (!docId || (field !== 'id' && field !== 'proof')) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  // ── Fetch doc from DB ────────────────────────────────────────────────────────
  const doc = await db.identityDocument.findUnique({
    where: { id: docId },
    select: { fileUrl: true, proofOfAddressUrl: true },
  })

  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const blobUrl = field === 'id' ? doc.fileUrl : doc.proofOfAddressUrl

  // ── Proxy blob content ───────────────────────────────────────────────────────
  // Fetch the blob on the server and pipe back — the blob URL never reaches
  // the browser so it cannot be bookmarked, shared, or leaked in request logs.
  const upstream = await fetch(blobUrl, { cache: 'no-store' })

  if (!upstream.ok) {
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 502 })
  }

  const body        = await upstream.arrayBuffer()
  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'

  return new NextResponse(body, {
    headers: {
      'Content-Type':        contentType,
      'Content-Disposition': 'inline',
      'Cache-Control':       'no-store',
      'X-Robots-Tag':        'noindex',
    },
  })
}
