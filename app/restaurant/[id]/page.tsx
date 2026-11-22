"use client";

import { use } from "react";
import NomadTravelApp from "@/components/NomadTravelApp";

export default function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const cityId = parseInt(id, 10) || 1;

  return <NomadTravelApp defaultCityId={cityId} />;
}
