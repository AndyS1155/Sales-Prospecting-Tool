import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { business, platforms } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    const prompt = `
Write a concise and professional introductory email to the business "${business.name}", located at "${business.full_address}", with website: ${business.website || "no website provided"}.

The business is currently using the following platforms or services:
${platforms && Object.keys(platforms).length
  ? Object.entries(platforms)
      .filter(([key]) => key !== "email" && key !== "phone")
      .map(([key, val]) => `- ${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
      .join("\n")
  : "- No platform data available"}

Your goal is to:
- Outline that you work with many businesses in a similar area
- Highlight that Square can provide functional and financial efficiencies
- Provide a clear call to action for the recipient to organise a call or meeting to discuss a business partnership further

Be polite, confident, and concise.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "We couldn't generate an email at this time.";

    console.log("Generated email for:", business.name);
    return NextResponse.json({ content });

  } catch (err) {
    console.error("OpenAI API error:", err);
    return NextResponse.json({ error: "Failed to generate details" }, { status: 500 });
  }
}

