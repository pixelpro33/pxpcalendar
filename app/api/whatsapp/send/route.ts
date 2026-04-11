import { NextResponse } from "next/server";

export async function POST() {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const to = process.env.WHATSAPP_TO;

    if (!accessToken || !phoneNumberId || !to) {
      return NextResponse.json(
        { success: false, error: "Missing WhatsApp environment variables." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: "hello_world",
            language: { code: "en_US" },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to send WhatsApp message." },
      { status: 500 }
    );
  }
}