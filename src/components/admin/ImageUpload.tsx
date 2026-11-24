"use client";

import { X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Product Image" }: ImageUploadProps) {
  return (
    <div className="space-y-4 w-full">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
        {label} URL
      </label>

      {value && (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm group">
          <Image
            src={value}
            alt="Upload preview"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all hover:scale-110 shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <input
        type="url"
        placeholder="https://example.com/image.jpg"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
      />
    </div>
  );
}
