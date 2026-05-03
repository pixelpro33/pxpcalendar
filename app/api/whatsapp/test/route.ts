import {
  buildWhatsAppMessage,
  getWhatsAppSettings,
  saveWhatsAppSettings,
  sendWhatsAppText,
} from "@/lib/whatsapp";

function getMetaErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") {
    return "";
  }

  const root = data as {
    error?: {
      message?: string;
      type?: string;
      code?: number;
      error_subcode?: number;
      fbtrace_id?: string;
    };
  };

  const error = root.error;

  if (!error) {
    return "";
  }

  const parts = [
    error.message ? `Meta: ${error.message}` : "",
    error.code ? `Code: ${error.code}` : "",
    error.error_subcode ? `Subcode: ${error.error_subcode}` : "",
    error.type ? `Type: ${error.type}` : "",
    error.fbtrace_id ? `Trace: ${error.fbtrace_id}` : "",
  ].filter(Boolean);

  return parts.join(" | ");
}

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
      const metaMessage = getMetaErrorMessage(result.data);

      console.error("WHATSAPP META SEND ERROR:", {
        status: result.status,
        metaResponse: result.data,
      });

      return Response.json(
        {
          error: true,
          sent: false,
          message: metaMessage || "Meta WhatsApp a respins mesajul.",
          metaStatus: result.status,
          metaResponse: result.data,
          preview: preview.message,
          debug: {
            hasPreview: Boolean(preview.message),
            previewLength: preview.message.length,
            templateMode: Boolean(process.env.WHATSAPP_TEMPLATE_NAME),
            templateName: process.env.WHATSAPP_TEMPLATE_NAME || null,
            templateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE || null,
            hasToken: Boolean(process.env.WHATSAPP_TOKEN),
            hasPhoneId: Boolean(process.env.WHATSAPP_PHONE_ID),
            hasTo: Boolean(process.env.WHATSAPP_TO),
          },
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
