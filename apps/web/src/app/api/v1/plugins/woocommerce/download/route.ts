import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import JSZip from "jszip";

/**
 * Dynamically packages the official installable WordPress/WooCommerce PHP Bridge Plugin
 * into a ready-to-upload WordPress .zip archive!
 */
export async function GET() {
  try {
    const pluginDir = path.resolve(process.cwd(), "../../plugins/woocommerce-norminvoice");
    const phpCode = await fs.readFile(path.join(pluginDir, "norminvoice-eu-einvoicing.php"), "utf8");
    const readme = await fs.readFile(path.join(pluginDir, "readme.txt"), "utf8");

    const zip = new JSZip();
    const folder = zip.folder("woocommerce-norminvoice")!;
    folder.file("norminvoice-eu-einvoicing.php", phpCode);
    folder.file("readme.txt", readme);

    const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="woocommerce-norminvoice-v1.1.0.zip"',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Plugin archive unavailable" },
      { status: 500 }
    );
  }
}
