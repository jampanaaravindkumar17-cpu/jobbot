import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractText } from "unpdf";

export const runtime = "nodejs";

export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const ocrText =
      formData.get("ocrText");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "No resume file was provided.",
        },
        { status: 400 }
      );
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          error:
            "Resume must be smaller than 5 MB.",
        },
        { status: 400 }
      );
    }

    const fileName =
      file.name.toLowerCase();

    const buffer =
      Buffer.from(
        await file.arrayBuffer()
      );

    let text = "";

    // ==================================================
    // OCR TEXT
    // ==================================================

    if (
      typeof ocrText === "string" &&
      ocrText.trim()
    ) {
      text = ocrText;
    }

    // ==================================================
    // NORMAL PDF
    // ==================================================

    else if (
      fileName.endsWith(".pdf")
    ) {
      const result =
        await extractText(
          new Uint8Array(buffer),
          {
            mergePages: true,
          }
        );

      text = result.text;
    }

    // ==================================================
    // DOCX
    // ==================================================

    else if (
      fileName.endsWith(".docx")
    ) {
      const result =
        await mammoth.extractRawText(
          {
            buffer,
          }
        );

      text = result.value;
    }

    else {
      return NextResponse.json(
        {
          error:
            "Only PDF and DOCX files are supported.",
        },
        { status: 400 }
      );
    }

    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // ==================================================
    // IMAGE PDF
    // ==================================================

    if (!text) {
      return NextResponse.json(
        {
          error:
            "NO_TEXT_FOUND: This PDF does not contain selectable text. OCR is required.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      text,
      characters: text.length,
    });
  } catch (error) {
    console.error(
      "Resume analysis error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze resume.",
      },
      { status: 500 }
    );
  }
}