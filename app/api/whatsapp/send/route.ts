import {
  buildWhatsAppMessage,
  getWhatsAppSettings,
  sendWhatsAppText,
} from "@/lib/whatsapp";

export async function POST() {
  try {
    const settings = await getWhatsAppSettings();

    const preview = await buildWhatsAppMessage({
      settings,
      isTest: true,
    });

    const result = await sendWhatsAppText(preview.message);

    if (!result.ok) {
      return Response.json(
        {
          error: true,
          message: "WhatsApp send failed.",
          preview: preview.message,
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
    console.error("WHATSAPP SEND ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "WhatsApp send failed.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
