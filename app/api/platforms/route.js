import { NextResponse } from 'next/server';

export async function POST(req) {
  const { website } = await req.json();

  try {
    const normalizedURL = website.startsWith('http') ? website : `https://${website}`;
    const res = await fetch(normalizedURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SquareAppBot/1.0)',
      },
    });

    if (!res.ok) {
      console.warn(`Could not fetch: ${normalizedURL} - Status ${res.status}`);
      throw new Error(`Failed to fetch website: ${res.status}`);
    }

    const html = await res.text();
    const detected = {};

    const platformChecks = {
      tableBooking: [
        { keyword: /opentable/i, name: "OpenTable" },
        { keyword: /resy/i, name: "Resy" },
        { keyword: /sevenrooms/i, name: "SevenRooms" },
        { keyword: /bookatable/i, name: "Bookatable" }
      ],
      ordering: [
        { keyword: /squareup|square.site/i, name: "Square" },
        { keyword: /toasttab/i, name: "Toast" },
        { keyword: /ubereats/i, name: "Uber Eats" },
        { keyword: /doordash/i, name: "DoorDash" },
        { keyword: /deliveroo/i, name: "Deliveroo" }
      ],
      ecommerce: [
        { keyword: /shopify/i, name: "Shopify" },
        { keyword: /woocommerce/i, name: "WooCommerce" },
        { keyword: /bigcommerce/i, name: "BigCommerce" },
        { keyword: /wix/i, name: "Wix" },
        { keyword: /squarespace/i, name: "Squarespace" }
      ],
      loyalty: [
        { keyword: /fivestars/i, name: "FiveStars" },
        { keyword: /belly/i, name: "Belly" },
        { keyword: /loyalzoo/i, name: "Loyalzoo" }
      ],
      payments: [
        { keyword: /stripe/i, name: "Stripe" },
        { keyword: /paypal/i, name: "PayPal" },
        { keyword: /square/i, name: "Square" },
        { keyword: /adyen/i, name: "Adyen" },
        { keyword: /klarna/i, name: "Klarna" }
      ],
      giftCards: [
        { keyword: /(squareup.*gift-cards|giftup|giftcard)/i, name: "Gift Cards Detected" }
      ],
      websiteBuilder: [
        { keyword: /shopify/i, name: "Shopify" },
        { keyword: /wix/i, name: "Wix" },
        { keyword: /squarespace/i, name: "Squarespace" },
        { keyword: /wordpress/i, name: "WordPress" }
      ],
      social: [
        { keyword: /facebook.com/i, name: "Facebook" },
        { keyword: /instagram.com/i, name: "Instagram" },
        { keyword: /twitter.com|x.com/i, name: "Twitter/X" },
        { keyword: /linkedin.com/i, name: "LinkedIn" },
        { keyword: /tiktok.com/i, name: "TikTok" }
      ]
    };

    // Contact Info
    detected.email = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)?.[0] || "Not found";
    detected.phone = html.match(/((\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})/)?.[0] || "Not found";

    // Platform Matching
    for (const category in platformChecks) {
      const matches = platformChecks[category]
        .filter(({ keyword }) => keyword.test(html))
        .map(({ name }) => name);

      detected[category] = matches.length ? matches : ["Check Website"];
    }

    return NextResponse.json(detected);
  } catch (err) {
    console.error("Platform detection error:", err);
    return NextResponse.json({ error: "Could not scan website." }, { status: 500 });
  }
}
