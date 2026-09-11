"use client";

import { ChangeEvent, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ResumePage() {
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please upload a PDF or DOCX resume.");
      setMessageType("error");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setMessage("Resume file must be smaller than 5 MB.");
      setMessageType("error");
      return;
    }

    setUploading(true);
    setMessage("");
    setMessageType("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please log in before uploading your resume.");
      }

      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      const safeFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .replace(/_+/g, "_");

      const filePath = `${user.id}/${Date.now()}_${safeFileName}`;

      const { error: uploadError } = await supabase.storage
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
      setFileSize(`${(file.size / 1024 / 1024).toFixed(2)} MB`);

      setMessage(
        `Resume uploaded successfully${fileExtension ? ` as ${fileExtension.toUpperCase()}` : ""}.`
      );
      setMessageType("success");
    } catch (error) {
      console.error("Resume upload error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload your resume. Please try again."
      );
      setMessageType("error");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const removeFile = () => {
    setFileName("");
    setFileSize("");
    setMessage("");
    setMessageType("");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative min-h-screen">
        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-white/10 px-5 sm:px-8">
          <div>
            <h1 className="text-xl font-semibold">Resume</h1>

            <p className="hidden text-xs text-slate-500 sm:block">
              Manage your resume and profile
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold">
              A
            </div>

            <div className="hidden sm:block">
              <p className="text-xs font-medium">Job Seeker</p>
              <p className="text-[10px] text-slate-500">Free Plan</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-5xl p-5 sm:p-8">
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Your Resume
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Upload your resume once. JobBot will use it to understand your
              skills and find jobs that match your profile.
            </p>
          </div>

          {/* Upload Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            {!fileName ? (
              <label
                className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 px-6 py-14 text-center transition ${
                  uploading
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:border-cyan-400/40 hover:bg-cyan-400/[0.03]"
                }`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-3xl text-cyan-400">
                  {uploading ? "..." : "↑"}
                </div>

                <h3 className="mt-5 text-base font-semibold">
                  {uploading ? "Uploading resume..." : "Upload your resume"}
                </h3>

                <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                  Upload your latest resume in PDF or DOCX format. JobBot will
                  analyze it for job matching.
                </p>

                {!uploading && (
                  <span className="mt-5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-500/20">
                    Choose Resume
                  </span>
                )}

                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleFileChange}
                />

                <p className="mt-4 text-[10px] text-slate-600">
                  Supported formats: PDF, DOCX • Maximum size: 5 MB
                </p>
              </label>
            ) : (
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-xl text-cyan-400">
                      ▤
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {fileName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {fileSize} • Uploaded successfully
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={removeFile}
                    className="rounded-lg bg-white/5 px-4 py-2 text-xs font-medium text-slate-400 transition hover:bg-red-400/10 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Upload Message */}
            {message && (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-xs ${
                  messageType === "success"
                    ? "border-cyan-400/20 bg-cyan-400/[0.05] text-cyan-400"
                    : "border-red-400/20 bg-red-400/[0.05] text-red-400"
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Resume Analysis */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Resume Analysis</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Extracted information from your resume will appear here.
                </p>
              </div>

              <span className="shrink-0 rounded-lg bg-white/5 px-3 py-2 text-[10px] text-slate-500">
                Not analyzed
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-slate-500">Target Roles</p>

                <p className="mt-2 text-sm text-slate-600">
                  Waiting for resume analysis
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-slate-500">Skills</p>

                <p className="mt-2 text-sm text-slate-600">
                  Waiting for resume analysis
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-slate-500">Experience</p>

                <p className="mt-2 text-sm text-slate-600">
                  Waiting for resume analysis
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-slate-500">Education</p>

                <p className="mt-2 text-sm text-slate-600">
                  Waiting for resume analysis
                </p>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">
            <p className="text-sm font-semibold">Your resume</p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Your resume is stored in your private JobBot storage area and
              will be used to match you with relevant opportunities.
            </p>
          </div>

          {/* Copyright */}
          <p className="mt-8 pb-4 text-center text-xs text-slate-600">
            © 2026 JobBot by JAMPANA ARAVIND KUMAR
          </p>
        </div>
      </div>
    </main>
  );
}