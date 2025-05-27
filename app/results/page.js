"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("/components/Map"), { ssr: false });


export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query") || "";

  const [businesses, setBusinesses] = useState([]);
  const [details, setDetails] = useState("");
  const [platforms, setPlatforms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);

  const businessRefs = useRef({});

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        const withIds = data.map((b, i) => ({ ...b, id: b.id || i }));
        setBusinesses(withIds);
      } catch (err) {
        alert("Failed to load results");
      }
      setLoading(false);
    };
    fetchBusinesses();
  }, [query]);

  const getDetails = async (business) => {
    setSelectedBusinessId(business.id);
    setPlatforms(null);
    setDetails("");

    try {
      if (business.website) {
        const res = await fetch("/api/platforms", {
          method: "POST",
          body: JSON.stringify({ website: business.website }),
        });
        const data = await res.json();
        setPlatforms(data);
      }

      const res2 = await fetch("/api/details", {
        method: "POST",
        body: JSON.stringify({ business, platforms }),
      });
      const data2 = await res2.json();
      setDetails(data2.content);
    } catch (err) {
      alert("Failed to load details");
    }
  };

  useEffect(() => {
    if (selectedBusinessId && businessRefs.current[selectedBusinessId]) {
      businessRefs.current[selectedBusinessId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedBusinessId]);

  const platformGroups = {
    "Table_Booking": platforms?.tableBooking || [],
    "Ordering": platforms?.ordering || [],
    "Ecommerce": platforms?.ecommerce || [],
    "Loyalty": platforms?.loyalty || [],
    "Payments": platforms?.payments || [],
    "Gift_Cards": platforms?.giftCards || [],
    "Website_Builder": platforms?.websiteBuilder || [],
    "Social": platforms?.social || []
  };

  const highlightSquare = (value) =>
    Array.isArray(value)
      ? value.map((v) =>
          v.toLowerCase().includes("square") ? `<span class='text-green-400 font-semibold'>${v}</span>` : v
        ).join(", ")
      : value;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Search Results</h1>
        <button
          onClick={() => router.push("/")}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
        >
          Start New Search
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <>
          <Map
            businesses={businesses}
            selectedBusinessId={selectedBusinessId}
            onMarkerClick={(id) => setSelectedBusinessId(id)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {businesses.map((b, i) => (
              <div
                key={b.id || i}
                ref={(el) => (businessRefs.current[b.id || i] = el)}
                className={`p-4 rounded-md shadow-md border ${
                  selectedBusinessId === b.id
                    ? "border-yellow-500 bg-gray-700"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <h3 className="text-lg font-bold">{b.name}</h3>
                <p className="text-gray-300">{b.full_address}</p>
                <button
                  className="mt-3 px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded"
                  onClick={() => getDetails(b)}
                >
                  Get Details & Email
                </button>
              </div>
            ))}
          </div>

          {platforms && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-gray-800 p-4 border border-gray-700 rounded">
                <h3 className="text-lg font-semibold mb-2 text-marketBlue">Business Contact Info</h3>
                <p className="text-white text-sm">
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${platforms.email}`} className="text-sky-400 underline">
                    {platforms.email}
                  </a>
                </p>
                <p className="text-white text-sm">
                  <strong>Phone:</strong>{" "}
                  <a href={`tel:${platforms.phone}`} className="text-sky-400 underline">
                    {platforms.phone}
                  </a>
                </p>
                <p className="text-white text-sm mb-4">
                  <strong>Website:</strong>{" "}
                  <a
                    href={
                      businesses.find((b) => b.id === selectedBusinessId)?.website?.startsWith("http")
                        ? businesses.find((b) => b.id === selectedBusinessId).website
                        : `https://${businesses.find((b) => b.id === selectedBusinessId)?.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 underline"
                  >
                    {businesses.find((b) => b.id === selectedBusinessId)?.website}
                  </a>
                </p>
              </div>

              <div className="bg-gray-800 p-4 border border-gray-700 rounded">
                <h3 className="text-lg font-semibold mb-2 text-marketBlue">Detected Platforms</h3>
                <div className="space-y-3">
                  {Object.entries(platformGroups).map(([group, values], index) => (
                    <div key={index}>
                      <strong className="text-white">{group.replace("_", " ")}:</strong>
                      <p
                        className="text-sm mt-1 text-gray-300"
                        dangerouslySetInnerHTML={{
                          __html: values.length
                            ? highlightSquare(values)
                            : "<span class='text-gray-500'>None detected</span>"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {details && (
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-md shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-green-400">Generated Details & Email</h2>
              <pre className="whitespace-pre-wrap text-gray-100 text-sm">{details}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}