"use client";

import { use } from "react";
import { OrderClaimForm } from "@/components/commerce/OrderClaimForm";

export default function ExchangeRequestPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  return <OrderClaimForm orderId={orderId} mode="exchange" />;
}
