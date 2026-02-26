import React, { Suspense } from "react";
import { chickenGame } from "@/lib/chickenGameConfig";
import ChickenCrossing from "@/components/chicken-crossing/ChickenCrossing";

export async function generateMetadata() {
  return {
    title: chickenGame.title,
    description: chickenGame.description,
  };
}

const ChickenCrossingPage: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-row mb-2 sm:mb-4">
        <h1 className="text-3xl font-semibold mr-2">
          {chickenGame.title}
        </h1>
      </div>
      <Suspense fallback={<div>Loading game...</div>}>
        <ChickenCrossing game={chickenGame} />
      </Suspense>
    </div>
  );
};

export default ChickenCrossingPage;