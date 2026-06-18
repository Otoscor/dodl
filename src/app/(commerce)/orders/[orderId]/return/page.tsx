"use client";

import { use } from "react";
import { OrderClaimForm } from "@/components/commerce/OrderClaimForm";

export default function ReturnRequestPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  return <OrderClaimForm orderId={orderId} mode="return" />;
}
