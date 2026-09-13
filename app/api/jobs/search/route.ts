import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Experience =
  | "Fresher"
  | "1–3 years"
  | "4–6 years"
  | "6+ years";

type JobType =
  | "Full-time"
  | "Part-time"
  | "Internship"
  | "Contract"
  | "Temporary";

type RequestData = {
  roles: string[];
  locations: string[];
  experience: Experience;
  jobTypes: JobType[];
  resumeText: string;
};

type AdzunaJob = {
  id?: string | number;
  title?: string;
  description?: string;
  redirect_url?: string;
  salary_min?: number;
  salary_max?: number;
  company?: {
    display_name?: string;
  };
  location?: {
    display_name?: string;
  };
  contract_type?: string;
  contract_time?: string;
  category?: {
    label?: string;
  };
};

type MatchedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  matchPercentage: number;
  matchedKeywords: string[];
};

// ======================================================
// NORMALIZE
// ======================================================

function normalize(
  text: string
): string {
  return text
    .toLowerCase()
    .replace(
      /[^a-z0-9+#.\- ]/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

// ======================================================
// RESUME KEYWORDS
// ======================================================

function extractResumeKeywords(
  resumeText: string
): string[] {
  const stopWords =
    new Set([
      "the",
      "and",
      "for",
      "with",
      "from",
      "this",
      "that",
      "have",
      "has",
      "are",
      "was",
      "were",
      "will",
      "your",
      "you",
      "our",
      "their",
      "into",
      "using",
      "used",
      "use",
      "work",
      "working",
      "experience",
      "education",
      "project",
      "projects",
      "resume",
      "email",
      "phone",
      "address",
      "india",
      "college",
      "university",
      "degree",
    ]);

  const words =
    normalize(resumeText)
      .split(" ")
      .filter(
        (word) =>
          word.length >= 3 &&
          !stopWords.has(word)
      );

  return [
    ...new Set(words),
  ];
}

// ======================================================
// ROLE TERMS
// ======================================================

function buildRoleTerms(
  roles: string[]
): string[] {
  const terms: string[] = [];

  for (const role of roles) {
    const normalizedRole =
      normalize(role);

    if (!normalizedRole) {
      continue;
    }

    // Complete role
    terms.push(
      normalizedRole
    );

    // Individual meaningful
    // words allow partial search.
    const words =
      normalizedRole.split(" ");

    for (const word of words) {
      if (word.length >= 4) {
        terms.push(word);
      }
    }
  }

  return [
    ...new Set(terms),
  ];
}

// ======================================================
// EXPERIENCE
// ======================================================

function experienceTerms(
  experience: Experience
): string[] {
  switch (experience) {
    case "Fresher":
      return [
        "fresher",
        "entry level",
        "entry-level",
        "graduate",
        "junior",
        "intern",
        "0 years",
        "no experience",
      ];

    case "1–3 years":
      return [
        "1 year",
        "2 years",
        "3 years",
        "1-3 years",
        "1 to 3 years",
        "junior",
      ];

    case "4–6 years":
      return [
        "4 years",
        "5 years",
        "6 years",
        "4-6 years",
        "4 to 6 years",
        "mid level",
        "mid-level",
      ];

    case "6+ years":
      return [
        "6 years",
        "7 years",
        "8 years",
        "9 years",
        "10 years",
        "11 years",
        "12 years",
        "senior",
        "lead",
      ];

    default:
      return [];
  }
}

// ======================================================
// JOB TYPE
// ======================================================

function jobTypeTerms(
  jobTypes: JobType[]
): string[] {
  return jobTypes.map(
    (type) =>
      normalize(type)
  );
}

// ======================================================
// MATCHING
// ======================================================

function calculateMatch(
  job: AdzunaJob,
  data: RequestData
): {
  score: number;
  matchedKeywords: string[];
} {
  const jobText =
    normalize(
      [
        job.title || "",
        job.description || "",
        job.contract_type || "",
        job.contract_time || "",
        job.category?.label ||
          "",
      ].join(" ")
    );

  const roleTerms =
    buildRoleTerms(
      data.roles
    );

  const resumeKeywords =
    extractResumeKeywords(
      data.resumeText
    );

  const experienceWords =
    experienceTerms(
      data.experience
    );

  const typeWords =
    jobTypeTerms(
      data.jobTypes
    );

  let roleScore = 0;
  let resumeScore = 0;
  let experienceScore = 0;
  let typeScore = 0;

  const matchedKeywords: string[] =
    [];

  // ==================================================
  // ROLE SCORE = 40
  // ==================================================

  const matchedRoles =
    roleTerms.filter(
      (term) =>
        jobText.includes(term)
    );

  if (
    matchedRoles.length > 0
  ) {
    roleScore = 40;

    matchedKeywords.push(
      ...matchedRoles
    );
  }

  // ==================================================
  // RESUME SCORE = 40
  // ==================================================

  const matchedResumeKeywords =
    resumeKeywords.filter(
      (keyword) =>
        jobText.includes(
          keyword
        )
    );

  const uniqueResumeMatches =
    [
      ...new Set(
        matchedResumeKeywords
      ),
    ];

  if (
    uniqueResumeMatches.length >
    0
  ) {
    resumeScore =
      Math.min(
        40,
        uniqueResumeMatches.length *
          2
      );

    matchedKeywords.push(
      ...uniqueResumeMatches
    );
  }

  // ==================================================
  // EXPERIENCE SCORE = 10
  // ==================================================

  const experienceMatch =
    experienceWords.some(
      (term) =>
        jobText.includes(
          normalize(term)
        )
    );

  if (
    experienceMatch
  ) {
    experienceScore = 10;
  } else if (
    data.experience ===
    "Fresher"
  ) {
    if (
      /entry|junior|graduate|intern|0 year|no experience/.test(
        jobText
      )
    ) {
      experienceScore = 10;
    }
  }

  // ==================================================
  // JOB TYPE SCORE = 10
  // ==================================================

  const typeMatch =
    typeWords.some(
      (type) =>
        jobText.includes(type)
    );

  if (typeMatch) {
    typeScore = 10;
  }

  // ==================================================
  // FINAL
  // ==================================================

  const score =
    Math.max(
      0,
      Math.min(
        100,
        roleScore +
          resumeScore +
          experienceScore +
          typeScore
      )
    );

  return {
    score: Math.round(score),

    matchedKeywords: [
      ...new Set(
        matchedKeywords
      ),
    ].slice(0, 20),
  };
}

// ======================================================
// ADZUNA SEARCH
// ======================================================

async function searchAdzuna(
  role: string,
  location: string,
  country: string,
  appId: string,
  appKey: string
): Promise<AdzunaJob[]> {
  const params =
    new URLSearchParams();

  params.set(
    "app_id",
    appId
  );

  params.set(
    "app_key",
    appKey
  );

  params.set(
    "results_per_page",
    "20"
  );

  params.set(
    "what",
    role
  );

  if (location.trim()) {
    params.set(
      "where",
      location
    );
  }

  const url =
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`;

  const response =
    await fetch(url, {
      cache: "no-store",
    });

  if (!response.ok) {
    throw new Error(
      `Adzuna request failed with status ${response.status}.`
    );
  }

  const result =
    await response.json();

  if (
    !Array.isArray(
      result.results
    )
  ) {
    return [];
  }

  return result.results;
}

// ======================================================
// POST
// ======================================================

export async function POST(
  request: Request
) {
  try {
    const data =
      (await request.json()) as RequestData;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !Array.isArray(
        data.roles
      ) ||
      data.roles.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide at least one job role.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(
        data.jobTypes
      ) ||
      data.jobTypes.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Please select at least one job type.",
        },
        { status: 400 }
      );
    }

    if (
      typeof data.resumeText !==
        "string" ||
      !data.resumeText.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Resume text is required.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // ADZUNA CREDENTIALS
    // ==================================================

    const appId =
      process.env.ADZUNA_APP_ID;

    const appKey =
      process.env.ADZUNA_APP_KEY;

    const country =
      process.env.ADZUNA_COUNTRY ||
      "in";

    if (
      !appId ||
      !appKey
    ) {
      return NextResponse.json(
        {
          error:
            "Adzuna API credentials are not configured.",
        },
        { status: 500 }
      );
    }

    // ==================================================
    // LOCATIONS
    // ==================================================

    const locations =
      Array.isArray(
        data.locations
      ) &&
      data.locations.length > 0
        ? data.locations
        : [""];

    // ==================================================
    // FETCH JOBS
    // ==================================================

    const allJobs: AdzunaJob[] =
      [];

    for (
      const role of data.roles
    ) {
      for (
        const location of locations
      ) {
        try {
          const jobs =
            await searchAdzuna(
              role,
              location,
              country,
              appId,
              appKey
            );

          allJobs.push(
            ...jobs
          );
        } catch (error) {
          console.error(
            "Adzuna search failed:",
            error
          );
        }
      }
    }

    // ==================================================
    // REMOVE DUPLICATES
    // ==================================================

    const uniqueJobs =
      Array.from(
        new Map(
          allJobs.map(
            (job) => [
              String(
                job.id ??
                  `${job.title}-${job.company?.display_name}-${job.location?.display_name}`
              ),
              job,
            ]
          )
        ).values()
      );

    // ==================================================
    // MATCH
    // ==================================================

    const matchedJobs: MatchedJob[] =
      uniqueJobs
        .map(
          (job) => {
            const match =
              calculateMatch(
                job,
                data
              );

            let salary:
              | string
              | undefined;

            if (
              typeof job.salary_min ===
                "number" &&
              typeof job.salary_max ===
                "number"
            ) {
              salary =
                `${job.salary_min} - ${job.salary_max}`;
            }

            return {
              id: String(
                job.id ??
                  `${job.title}-${Date.now()}`
              ),

              title:
                job.title ||
                "Untitled Job",

              company:
                job.company
                  ?.display_name ||
                "Company not specified",

              location:
                job.location
                  ?.display_name ||
                "Location not specified",

              description:
                job.description ||
                "No job description available.",

              url:
                job.redirect_url ||
                "",

              salary,

              matchPercentage:
                match.score,

              matchedKeywords:
                match.matchedKeywords,
            };
          }
        )
        .filter(
          (job) =>
            job.matchPercentage >=
            20
        )
        .sort(
          (a, b) =>
            b.matchPercentage -
            a.matchPercentage
        );

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,
      total:
        matchedJobs.length,
      jobs: matchedJobs,
    });
  } catch (error) {
    console.error(
      "Job search error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to search and match jobs.",
      },
      { status: 500 }
    );
  }
}