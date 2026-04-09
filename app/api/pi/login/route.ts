import { NextRequest, NextResponse } from "next/server";

type PiMeResponse = {
  user?: {
    uid?: string;
    username?: string;
  };
  uid?: string;
  username?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body?.pi_auth_token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Missing pi_auth_token" },
        { status: 400 }
      );
    }

    const piResponse = await fetch("https://api.minepi.com/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const piData = (await piResponse.json()) as PiMeResponse;

    if (!piResponse.ok) {
      return NextResponse.json(
        {
          error: piData || "Pi verification failed",
        },
        { status: piResponse.status }
      );
    }

    const uid = piData?.user?.uid || piData?.uid;
    const username = piData?.user?.username || piData?.username;

    if (!uid || !username) {
      return NextResponse.json(
        { error: "Pi verification returned incomplete user data" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      id: uid,
      username,
      credits_balance: 0,
      terms_accepted: true,
    });
  } catch (error) {
    console.error("Pi login route failed:", error);
    return NextResponse.json(
      { error: "Pi login route failed" },
      { status: 500 }
    );
  }
}