"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push(`/results?query=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center">UK Sales Prospecting Tool</h1>
        <input
          className="px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md placeholder-gray-400 text-sm"
          placeholder="e.g. coffee shops in London"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm"
        >
          Search
        </button>
      </div>
    </div>
  );
}

