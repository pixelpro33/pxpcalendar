import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const subscriptionsFilePath = path.join(process.cwd(), "data", "subscriptions.json");

function ensureDataFile() {
  const dataDir = path.dirname(subscriptionsFilePath);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(subscriptionsFilePath)) {
    fs.writeFileSync(subscriptionsFilePath, "[]", "utf8");
  }
}

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    ensureDataFile();

    const currentData = JSON.parse(fs.readFileSync(subscriptionsFilePath, "utf8"));

    const exists = currentData.some(
      (item: { endpoint: string }) => item.endpoint === subscription.endpoint
    );

    if (!exists) {
      currentData.push(subscription);
      fs.writeFileSync(subscriptionsFilePath, JSON.stringify(currentData, null, 2), "utf8");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}