import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get search inputs from the JobBot website
  const role = searchParams.get("role") || "VLSI Engineer";
  const location = searchParams.get("location") || "Hyderabad";

  // Get Adzuna credentials from environment variables
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  // Check whether credentials exist
  if (!appId || !appKey) {
    return NextResponse.json(
      {
        error: "Adzuna API credentials are not configured.",
      },
      { status: 500 }
    );
  }

  // India Adzuna API
  const country = "in";

  // Build Adzuna search URL
  const url =
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1` +
    `?app_id=${encodeURIComponent(appId)}` +
    `&app_key=${encodeURIComponent(appKey)}` +
    `&what=${encodeURIComponent(role)}` +
    `&where=${encodeURIComponent(location)}` +
    `&results_per_page=20` +
    `&content-type=application/json`;

  try {
    // Request real jobs from Adzuna
    const response = await fetch(url, {
      cache: "no-store",
    });

    // Handle Adzuna errors
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

    // Convert Adzuna response to JSON
    const data = await response.json();

    // Return real job data to JobBot
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