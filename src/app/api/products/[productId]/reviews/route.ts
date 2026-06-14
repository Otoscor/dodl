import { NextRequest, NextResponse } from "next/server";
import { getReviews, createReview } from "@/lib/queries/products";
import { getSessionId } from "@/lib/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const reviews = getReviews(productId);
  return NextResponse.json({ reviews });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const sessionId = await getSessionId();
  const body = await request.json();

  const { author_name, rating, body: reviewBody, photo_urls } = body;

  if (!author_name || typeof author_name !== "string" || author_name.trim().length === 0) {
    return NextResponse.json({ success: false, message: "이름을 입력해주세요." }, { status: 400 });
  }
  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ success: false, message: "별점을 선택해주세요." }, { status: 400 });
  }

  const result = createReview(productId, sessionId, {
    author_name,
    rating,
    body: reviewBody ?? "",
    photo_urls: Array.isArray(photo_urls) ? photo_urls : [],
  });

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
