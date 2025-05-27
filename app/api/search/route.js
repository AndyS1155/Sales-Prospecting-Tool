import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { query } = await req.json();

    const data = JSON.stringify({
      q: query || "restaurant",
      page: 1,
      ll: "@51.5072,-0.1276,11z", // London center
      hl: "en",
      gl: "us",
      extra: true,
    });

    const response = await fetch("https://cloud.gmapsextractor.com/api/v2/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GMAPS_API_KEY}`,
      },
      body: data,
    });

    const result = await response.json();

    console.log("Raw API response:", result);
    console.log("Gmaps API key:", process.env.GMAPS_API_KEY);

  const cleanedResults = result.data?.slice(0, 10).map((b) => ({
  name: b.name,
  full_address: b.full_address,
  website: b.website,
  latitude: b.latitude,
  longitude: b.longitude,
}));


    return NextResponse.json(cleanedResults || []);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 });
  }
}

