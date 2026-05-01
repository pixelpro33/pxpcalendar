import { getWhatsAppSettings, saveWhatsAppSettings } from "@/lib/whatsapp";

export async function GET() {
  try {
    const settings = await getWhatsAppSettings();

    return Response.json(settings);
  } catch (error) {
    console.error("GET WHATSAPP SETTINGS ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut incarca setarile WhatsApp.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const settings = await saveWhatsAppSettings(body);

    return Response.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("PATCH WHATSAPP SETTINGS ERROR:", error);

    return Response.json(
      {
        error: true,
        message: "Nu am putut salva setarile WhatsApp.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
