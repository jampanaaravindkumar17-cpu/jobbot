"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { AppShell } from "../components/app-shell";

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

type Analysis = {
  text: string;
  fileName: string;
  characters: number;
  education: string;
  projects: string[];
  certifications: string[];
};

type Job = {
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

const EXPERIENCE_OPTIONS: Experience[] = [
  "Fresher",
  "1–3 years",
  "4–6 years",
  "6+ years",
];

const JOB_TYPE_OPTIONS: JobType[] = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Temporary",
];

// ======================================================
// CLEAN TEXT
// ======================================================

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ======================================================
// OCR FOR IMAGE / SCANNED PDF
// ======================================================

async function extractPdfTextWithOCR(
  file: File
): Promise<string> {
  const pdfjsLib = await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  );

  const { createWorker } = await import(
    "tesseract.js"
  );

  const arrayBuffer = await file.arrayBuffer();

  // The bundled PDF worker has a narrower public type than this browser-only setup.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadingTask = (pdfjsLib.getDocument as any)({
    data: new Uint8Array(arrayBuffer),
    disableWorker: true,
  });

  const pdf = await loadingTask.promise;

  const worker = await createWorker("eng");

  let fullText = "";

  try {
    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber++
    ) {
      const page = await pdf.getPage(pageNumber);

      const viewport = page.getViewport({
        scale: 2,
      });

      const canvas = document.createElement("canvas");

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "Could not create canvas for OCR."
        );
      }

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (page.render as any)({
        canvasContext: context,
        viewport,
      }).promise;

      const result = await worker.recognize(canvas);

      fullText += result.data.text + "\n";

      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    await worker.terminate();
  }

  return cleanText(fullText);
}

// ======================================================
// RESUME EXTRACTION
// ======================================================

function extractEducation(text: string): string {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .filter((line) =>
      /education|b\.?tech|b\.?e\.?|bachelor|degree|diploma|university|college|school|ssc|academic/i.test(
        line
      )
    )
    .slice(0, 8)
    .join(" • ");
}

function extractProjects(text: string): string[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .filter((line) =>
      /project|projects|developed|implemented|designed|prototype/i.test(
        line
      )
    )
    .slice(0, 8);
}

function extractCertifications(text: string): string[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .filter((line) =>
      /certification|certificate|certified|nptel|training|course|workshop/i.test(
        line
      )
    )
    .slice(0, 8);
}

// ======================================================
// DASHBOARD
// ======================================================

export default function DashboardPage() {
  const [roleInput, setRoleInput] = useState("");
  const [roles, setRoles] = useState<string[]>([]);

  const [locationInput, setLocationInput] =
    useState("");
  const [locations, setLocations] = useState<string[]>(
    []
  );

  const [experience, setExperience] =
    useState<Experience>("Fresher");

  const [jobTypes, setJobTypes] = useState<JobType[]>([
    "Full-time",
  ]);

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");

  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [findingJobs, setFindingJobs] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"success" | "error" | "info">("info");

  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    try {
      const draft = window.sessionStorage.getItem("jobbot.search-draft");
      if (!draft) return;

      const { role, location } = JSON.parse(draft) as {
        role?: string;
        location?: string;
      };

      if (role?.trim()) setRoles([role.trim()]);
      if (location?.trim()) setLocations([location.trim()]);
      window.sessionStorage.removeItem("jobbot.search-draft");
    } catch {
      window.sessionStorage.removeItem("jobbot.search-draft");
    }
  }, []);

  // ====================================================
  // ADD ROLE
  // ====================================================

  const addRole = () => {
    const role = roleInput.trim();

    if (!role) return;

    const exists = roles.some(
      (item) =>
        item.toLowerCase() === role.toLowerCase()
    );

    if (!exists) {
      setRoles((current) => [...current, role]);
    }

    setRoleInput("");
  };

  const removeRole = (role: string) => {
    setRoles((current) =>
      current.filter((item) => item !== role)
    );
  };

  // ====================================================
  // ADD LOCATION
  // ====================================================

  const addLocation = () => {
    const location = locationInput.trim();

    if (!location) return;

    const exists = locations.some(
      (item) =>
        item.toLowerCase() ===
        location.toLowerCase()
    );

    if (!exists) {
      setLocations((current) => [
        ...current,
        location,
      ]);
    }

    setLocationInput("");
  };

  const removeLocation = (location: string) => {
    setLocations((current) =>
      current.filter(
        (item) => item !== location
      )
    );
  };

  // ====================================================
  // JOB TYPES
  // ====================================================

  const toggleJobType = (type: JobType) => {
    setJobTypes((current) => {
      if (current.includes(type)) {
        return current.filter(
          (item) => item !== type
        );
      }

      return [...current, type];
    });
  };

  // ====================================================
  // UPLOAD + ANALYZE + SEARCH
  // ====================================================

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (roles.length === 0) {
      setMessage(
        "Please add at least one target job role."
      );
      setMessageType("error");
      event.target.value = "";
      return;
    }

    if (locations.length === 0) {
      setMessage(
        "Please add at least one job location."
      );
      setMessageType("error");
      event.target.value = "";
      return;
    }

    if (jobTypes.length === 0) {
      setMessage(
        "Please select at least one job type."
      );
      setMessageType("error");
      event.target.value = "";
      return;
    }

    const lowerName =
      file.name.toLowerCase();

    const validFile =
      lowerName.endsWith(".pdf") ||
      lowerName.endsWith(".docx");

    if (!validFile) {
      setMessage(
        "Please upload a PDF or DOCX resume."
      );
      setMessageType("error");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage(
        "Resume must be smaller than 5 MB."
      );
      setMessageType("error");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setAnalyzing(false);
    setOcrRunning(false);
    setFindingJobs(false);

    setAnalysis(null);
    setJobs([]);

    try {
      // =================================================
      // 1. USER
      // =================================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Please log in before uploading your resume."
        );
      }

      // =================================================
      // 2. UPLOAD TO SUPABASE
      // =================================================

      setMessage("Uploading resume...");
      setMessageType("info");

      const safeFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .replace(/_+/g, "_");

      const filePath =
        `${user.id}/${Date.now()}_${safeFileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("resumes")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      setFileName(file.name);

      setFileSize(
        `${(
          file.size /
          1024 /
          1024
        ).toFixed(2)} MB`
      );

      // =================================================
      // 3. TEXT EXTRACTION
      // =================================================

      setUploading(false);
      setAnalyzing(true);

      setMessage("Reading your resume...");
      setMessageType("info");

      const formData = new FormData();

      formData.append("file", file);

      let response = await fetch(
        "/api/analyze-resume",
        {
          method: "POST",
          body: formData,
        }
      );

      const responseText =
        await response.text();

      let result: {
        success?: boolean;
        error?: string;
        text?: string;
        fileName?: string;
        characters?: number;
      } = {};

      try {
        result = responseText
          ? JSON.parse(responseText) as typeof result
          : {};
      } catch {
        throw new Error(
          "Resume analysis server returned an invalid response."
        );
      }

      // =================================================
      // 4. OCR
      // =================================================

      if (
        !response.ok &&
        result.error?.startsWith(
          "NO_TEXT_FOUND:"
        )
      ) {
        if (!lowerName.endsWith(".pdf")) {
          throw new Error(result.error);
        }

        setAnalyzing(false);
        setOcrRunning(true);

        setMessage(
          "Scanned PDF detected. Running OCR..."
        );

        setMessageType("info");

        const ocrText =
          await extractPdfTextWithOCR(file);

        if (!ocrText.trim()) {
          throw new Error(
            "OCR could not detect readable text from this PDF."
          );
        }

        const ocrFormData =
          new FormData();

        ocrFormData.append(
          "file",
          file
        );

        ocrFormData.append(
          "ocrText",
          ocrText
        );

        setOcrRunning(false);
        setAnalyzing(true);

        setMessage(
          "OCR completed. Finalizing resume analysis..."
        );

        response = await fetch(
          "/api/analyze-resume",
          {
            method: "POST",
            body: ocrFormData,
          }
        );

        const finalResponseText =
          await response.text();

        try {
          result = finalResponseText
            ? JSON.parse(finalResponseText)
            : {};
        } catch {
          throw new Error(
            "Resume analysis server returned an invalid response."
          );
        }

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.error ||
              "Unable to analyze OCR text."
          );
        }
      } else if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Unable to analyze the resume."
        );
      }

      // =================================================
      // 5. RESUME TEXT
      // =================================================

      const resumeText =
        result.text || "";

      if (!resumeText.trim()) {
        throw new Error(
          "No readable text was found in the resume."
        );
      }

      // =================================================
      // 6. RESUME ANALYSIS
      // =================================================

      const finalAnalysis: Analysis = {
        text: resumeText,

        fileName:
          result.fileName ||
          file.name,

        characters:
          result.characters ||
          resumeText.length,

        education:
          extractEducation(
            resumeText
          ),

        projects:
          extractProjects(
            resumeText
          ),

        certifications:
          extractCertifications(
            resumeText
          ),
      };

      setAnalysis(finalAnalysis);
      window.sessionStorage.setItem(
        "jobbot.resume-summary",
        JSON.stringify({
          fileName: finalAnalysis.fileName,
          characters: finalAnalysis.characters,
        })
      );

      // =================================================
      // 7. SEARCH JOBS
      // =================================================

      setAnalyzing(false);
      setFindingJobs(true);

      setMessage(
        "Searching jobs and matching them with your resume..."
      );

      setMessageType("info");

      const jobsResponse =
        await fetch(
          "/api/jobs/search",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              roles,
              locations,
              experience,
              jobTypes,
              resumeText,
            }),
          }
        );

      const jobsResponseText =
        await jobsResponse.text();

      let jobsResult: {
        error?: string;
        jobs?: Job[];
      } = {};

      try {
        jobsResult = jobsResponseText
          ? JSON.parse(
              jobsResponseText
            ) as typeof jobsResult
          : {};
      } catch {
        throw new Error(
          "Job search server returned an invalid response."
        );
      }

      if (!jobsResponse.ok) {
        throw new Error(
          jobsResult.error ||
            "Unable to find matching jobs."
        );
      }

      const foundJobs =
        Array.isArray(
          jobsResult.jobs
        )
          ? jobsResult.jobs
          : [];

      setJobs(foundJobs);
      window.sessionStorage.setItem(
        "jobbot.latest-jobs",
        JSON.stringify(foundJobs)
      );

      setMessage(
        `Resume analyzed successfully. ${foundJobs.length} matching jobs found.`
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "Dashboard resume processing error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to process the resume."
      );

      setMessageType("error");
    } finally {
      setUploading(false);
      setAnalyzing(false);
      setOcrRunning(false);
      setFindingJobs(false);

      event.target.value = "";
    }
  };

  // ====================================================
  // REMOVE RESUME
  // ====================================================

  const removeFile = () => {
    setFileName("");
    setFileSize("");
    setAnalysis(null);
    setJobs([]);
    setMessage("");
    window.sessionStorage.removeItem("jobbot.resume-summary");
    window.sessionStorage.removeItem("jobbot.latest-jobs");
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <AppShell>
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm font-semibold tracking-widest text-cyan-400">
            JOBBOT
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Find Your Next Job
          </h1>

          <p className="mt-3 max-w-3xl text-[var(--text-muted)]">
            Upload your resume, choose what you
            are looking for, and JobBot will find
            jobs that match your profile.
          </p>
        </div>

        {/* =================================================
            MAIN SETUP
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* =================================================
              JOB SEARCH
          ================================================= */}

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)]">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-400">
                  STEP 1
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  Job Search
                </h2>

                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Tell JobBot what kind of job you
                  want.
                </p>
              </div>

              <div className="rounded-xl bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300">
                Preferences
              </div>
            </div>

            {/* ROLE */}

            <div className="mt-6">
              <label className="text-sm font-medium">
                Job Role
              </label>

              <div className="mt-2 flex gap-2">
                <input
                  value={roleInput}
                  onChange={(e) =>
                    setRoleInput(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      e.preventDefault();
                      addRole();
                    }
                  }}
                  placeholder="e.g. Python Developer"
                  className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-cyan-400"
                />

                <button
                  type="button"
                  onClick={addRole}
                  className="rounded-xl bg-cyan-500 px-5 font-semibold text-black transition hover:bg-cyan-400"
                >
                  Add
                </button>
              </div>

              {roles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() =>
                        removeRole(
                          role
                        )
                      }
                      className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300"
                    >
                      {role} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* LOCATION */}

            <div className="mt-6">
              <label className="text-sm font-medium">
                Location
              </label>

              <div className="mt-2 flex gap-2">
                <input
                  value={
                    locationInput
                  }
                  onChange={(e) =>
                    setLocationInput(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      e.preventDefault();
                      addLocation();
                    }
                  }}
                  placeholder="e.g. Hyderabad"
                  className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-cyan-400"
                />

                <button
                  type="button"
                  onClick={
                    addLocation
                  }
                  className="rounded-xl bg-cyan-500 px-5 font-semibold text-black transition hover:bg-cyan-400"
                >
                  Add
                </button>
              </div>

              {locations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {locations.map(
                    (location) => (
                      <button
                        key={
                          location
                        }
                        type="button"
                        onClick={() =>
                          removeLocation(
                            location
                          )
                        }
                        className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300"
                      >
                        {location} ×
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* EXPERIENCE */}

            <div className="mt-6">
              <label className="text-sm font-medium">
                Experience
              </label>

              <div className="mt-3 grid grid-cols-2 gap-3">
                {EXPERIENCE_OPTIONS.map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setExperience(
                          item
                        )
                      }
                      className={`rounded-xl border px-4 py-3 text-sm transition ${
                        experience ===
                        item
                          ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                          : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* JOB TYPE */}

            <div className="mt-6">
              <label className="text-sm font-medium">
                Job Type
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                {JOB_TYPE_OPTIONS.map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        toggleJobType(
                          type
                        )
                      }
                      className={`rounded-xl border px-4 py-3 text-sm transition ${
                        jobTypes.includes(
                          type
                        )
                          ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                          : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      {type}
                    </button>
                  )
                )}
              </div>
            </div>

          </section>

          {/* =================================================
              RESUME
          ================================================= */}

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)]">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-400">
                  STEP 2
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  Upload Your Resume
                </h2>

                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  JobBot uses your resume to
                  personalize job matching.
                </p>
              </div>

              <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                PDF / DOCX
              </div>
            </div>

            {/* UPLOAD */}

            <div className="mt-6 rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] p-8 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl">
                📄
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                {fileName
                  ? "Resume Ready"
                  : "Upload your resume"}
              </h3>

              <p className="mt-2 text-sm text-[var(--text-faint)]">
                PDF or DOCX · Maximum 5 MB
              </p>

              <label className="mt-6 inline-flex cursor-pointer rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400">
                {ocrRunning
                  ? "Running OCR..."
                  : findingJobs
                  ? "Finding Jobs..."
                  : analyzing
                  ? "Analyzing..."
                  : uploading
                  ? "Uploading..."
                  : fileName
                  ? "Update Resume"
                  : "Choose Resume"}

                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={
                    handleFileChange
                  }
                  disabled={
                    uploading ||
                    analyzing ||
                    ocrRunning ||
                    findingJobs
                  }
                />
              </label>

              {fileName && (
                <div className="mt-6 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-left">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {fileName}
                    </p>

                    <p className="mt-1 text-sm text-[var(--text-faint)]">
                      {fileSize}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeFile
                    }
                    disabled={
                      uploading ||
                      analyzing ||
                      ocrRunning ||
                      findingJobs
                    }
                    className="ml-4 text-sm text-red-400 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              )}

            </div>

            {/* STATUS */}

            {message && (
              <div
                className={`mt-5 rounded-xl border p-4 text-sm ${
                  messageType ===
                  "error"
                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                    : messageType ===
                      "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                }`}
              >
                {message}
              </div>
            )}

          </section>

        </div>

        {/* =================================================
            RESUME ANALYSIS
        ================================================= */}

        {analysis && (
          <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)]">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-400">
                  STEP 3
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  Resume Analysis
                </h2>
              </div>

              <span className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                ✓ Analyzed
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">

              <InfoCard
                title="Resume"
                value={
                  analysis.fileName
                }
              />

              <InfoCard
                title="Characters"
                value={analysis.characters.toLocaleString()}
              />

              <InfoCard
                title="Status"
                value="Successfully analyzed"
              />

            </div>

            {analysis.education && (
              <div className="mt-6">
                <h3 className="font-semibold">
                  Education
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  {analysis.education}
                </p>
              </div>
            )}

            {analysis.projects.length >
              0 && (
              <div className="mt-6">
                <h3 className="font-semibold">
                  Projects
                </h3>

                <ul className="mt-3 space-y-2">
                  {analysis.projects.map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={index}
                        className="rounded-xl bg-[var(--surface-subtle)] p-3 text-sm text-[var(--text-muted)]"
                      >
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {analysis.certifications
              .length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold">
                  Certifications
                </h3>

                <ul className="mt-3 space-y-2">
                  {analysis.certifications.map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={index}
                        className="rounded-xl bg-[var(--surface-subtle)] p-3 text-sm text-[var(--text-muted)]"
                      >
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          </section>
        )}

        {/* =================================================
            MATCHED JOBS
        ================================================= */}

        {jobs.length > 0 && (
          <section className="mt-6">

            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-400">
                  STEP 4
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  Matching Jobs
                </h2>

                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Jobs are ranked using your
                  preferences and resume.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3">
                <p className="text-xs text-[var(--text-faint)]">
                  JOBS FOUND
                </p>

                <p className="text-xl font-bold">
                  {jobs.length}
                </p>
              </div>
            </div>

            <div className="space-y-4">

              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--card-shadow)] transition hover:border-[var(--border-strong)]"
                >

                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-[var(--text-muted)]">
                        {job.company}
                      </p>

                      <p className="mt-1 text-sm text-[var(--text-faint)]">
                        📍 {job.location}
                      </p>

                      {job.salary && (
                        <p className="mt-2 text-sm text-[var(--text-faint)]">
                          {job.salary}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 rounded-2xl bg-emerald-500/10 px-6 py-4 text-center">
                      <p className="text-xs text-[var(--text-faint)]">
                        MATCH
                      </p>

                      <p className="mt-1 text-3xl font-bold text-emerald-400">
                        {
                          job.matchPercentage
                        }%
                      </p>
                    </div>

                  </div>

                  {job.matchedKeywords
                    ?.length > 0 && (
                    <div className="mt-5">
                      <p className="text-sm text-[var(--text-faint)]">
                        Matching Resume Terms
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {job.matchedKeywords.map(
                          (
                            keyword
                          ) => (
                            <span
                              key={
                                keyword
                              }
                              className="rounded-lg bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300"
                            >
                              {
                                keyword
                              }
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {job.description && (
                    <p className="mt-5 line-clamp-4 text-sm leading-6 text-[var(--text-muted)]">
                      {
                        job.description
                      }
                    </p>
                  )}

                  {job.url && (
                    <a
                      href={
                        job.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-400"
                    >
                      View Job / Apply
                    </a>
                  )}

                </article>
              ))}

            </div>

          </section>
        )}

      </div>
    </div>
    </AppShell>
  );
}

// ======================================================
// INFO CARD
// ======================================================

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--text-faint)]">
        {title}
      </p>

      <p className="mt-2 break-words text-sm text-[var(--text)]">
        {value}
      </p>
    </div>
  );
}
