import {
  buildWhatsAppMessage,
  getWhatsAppSettings,
  saveWhatsAppSettings,
  sendWhatsAppText,
} from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const shouldSend = Boolean(body.send);
    const incomingSettings = body.settings;

    const settings = incomingSettings
      ? await saveWhatsAppSettings(incomingSettings)
      : await getWhatsAppSettings();

    const preview = await buildWhatsAppMessage({
      settings,
      isTest: true,
    });

    if (!shouldSend) {
      return Response.json({
        success: true,
        sent: false,
        ...preview,
      });
    }

    const result = await sendWhatsAppText(preview.message);

    if (!result.ok) {
      return Response.json(
        {
          error: true,
          sent: false,
          message: "Trimiterea WhatsApp a esuat.",
          preview: preview.message,
          details: result.data,
        },
        { status: result.status },
      );
    }

    return Response.json({
      success: true,
      sent: true,
      ...preview,
      whatsapp: result.data,
    });
  } catch (error) {
    console.error("WHATSAPP TEST ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Testul WhatsApp a esuat.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
