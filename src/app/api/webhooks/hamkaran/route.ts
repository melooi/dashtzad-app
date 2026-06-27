import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory ring buffer (max 200 events, reset on server restart)
const MAX = 200;
const events: object[] = [];

// Field names per Hamkaran webhook docs:
//   event_name: "Newstate" | "Hangup" | "Cdr" | "voiceMail"
//   uniq:        unique call identifier (same across all events of one call)
//   chanel:      channel name (note: Hamkaran spells it without 'n')
//   source:      caller number (Newstate)
//   CallerIDNum: caller number (Hangup, CDR)
//   disposition: "NO ANSWER" | "ANSWERED" | "FAILED" | "BUSY" | "CONGESTION" (CDR)
//   type:        "incoming_call" | "outgoing_call"

type HamEvent = {
  event_name?: string;
  uniq?: string;
  chanel?: string;
  source?: string;
  destination?: string;
  CallerIDNum?: string;
  ConnectedLineNum?: string;
  channel_state?: string;
  channel_state_desc?: string;
  type?: string;
  disposition?: string;
  BillableSeconds?: string;
  duration?: string;
  [k: string]: unknown;
};

async function handleMissedCall(callerNum: string): Promise<void> {
  if (!callerNum || callerNum === "anonymous") return;
  try {
    const user = await prisma.user.findFirst({
      where: { phoneNumber: { endsWith: callerNum.slice(-8) } },
      select: { id: true, name: true },
    });

    await prisma.conversation.create({
      data: {
        source: "voip",
        subject: `تماس از دست رفته — ${callerNum}`,
        guestPhone: callerNum,
        guestName: user?.name ?? callerNum,
        userId: user?.id ?? undefined,
        unreadForAdmin: 1,
        lastMessagePreview: `تماس از دست رفته از شماره ${callerNum}`,
      },
    });
  } catch {
    // Non-fatal — webhook must always return 200
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as HamEvent;
    const ev = { ...body, _receivedAt: new Date().toISOString() };
    events.unshift(ev);
    if (events.length > MAX) events.length = MAX;

    // CDR with NO ANSWER on incoming call → missed call → create conversation
    if (
      body.event_name === "Cdr" &&
      body.type === "incoming_call" &&
      body.disposition === "NO ANSWER"
    ) {
      const callerNum = body.CallerIDNum ?? body.source ?? "";
      await handleMissedCall(callerNum);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

// Admin can poll this to get recent events (used by VoipProvider)
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ events });
}
