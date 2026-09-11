import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const role = searchParams.get("role") || "VLSI Engineer";
  const location = searchParams.get("location") || "Hyderabad";

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return NextResponse.json(
      {
        error: "Adzuna credentials missing",
        appIdConfigured: !!appId,
        appKeyConfigured: !!appKey,
      },
      { status: 500 }
    );
  }

  const country = "in";

  const url =
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1` +
    `?app_id=${encodeURIComponent(appId)}` +
    `&app_key=${encodeURIComponent(appKey)}` +
    `&what=${encodeURIComponent(role)}` +
    `&where=${encodeURIComponent(location)}` +
    `&results_per_page=20` +
    `&content-type=application/json`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Adzuna API error:", response.status, errorText);

      return NextResponse.json(
        {
          error: "Adzuna job search failed.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Adzuna connection error:", error);

    return NextResponse.json(
      {
        error: "Unable to connect to Adzuna.",
      },
      { status: 500 }
    );
  }
}