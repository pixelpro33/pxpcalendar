import {
  buildWhatsAppMessage,
  getWhatsAppSettings,
  sendWhatsAppText,
} from "@/lib/whatsapp";

export async function GET() {
  try {
    const settings = await getWhatsAppSettings();

    if (!settings.enabled) {
      return Response.json({
        success: true,
        skipped: true,
        reason: "WhatsApp reminders disabled.",
      });
    }

    const preview = await buildWhatsAppMessage({
      settings,
      isTest: false,
    });

    if (!preview.hasItems && !settings.sendEmptyMessage) {
      return Response.json({
        success: true,
        skipped: true,
        reason: "No events and empty messages disabled.",
        preview,
      });
    }

    const result = await sendWhatsAppText(preview.message);

    if (!result.ok) {
      return Response.json(
        {
          error: true,
          message: "WhatsApp send failed.",
          preview,
          details: result.data,
        },
        { status: result.status },
      );
    }

    return Response.json({
      success: true,
      sent: true,
      preview,
      whatsapp: result.data,
    });
  } catch (error) {
    console.error("CRON ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Cron failed.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
