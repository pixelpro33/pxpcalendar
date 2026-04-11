import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import webpush from "web-push";

const subscriptionsFilePath = path.join(process.cwd(), "data", "subscriptions.json");

function readSubscriptions() {
  if (!fs.existsSync(subscriptionsFilePath)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(subscriptionsFilePath, "utf8"));
}

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:you@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function POST() {
  try {
    const subscriptions = readSubscriptions();

    if (!subscriptions.length) {
      return NextResponse.json(
        { success: false, message: "Nu exista subscriptions salvate." },
        { status: 400 }
      );
    }

    const payload = JSON.stringify({
      title: "pxpcalendar 🔔",
      body: "Aceasta este o notificare push reala.",
    });

    const results = await Promise.allSettled(
      subscriptions.map((subscription: webpush.PushSubscription) =>
        webpush.sendNotification(subscription, payload)
      )
    );

    const delivered = results.filter((result) => result.status === "fulfilled").length;

    return NextResponse.json({
      success: true,
      delivered,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Send push error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}