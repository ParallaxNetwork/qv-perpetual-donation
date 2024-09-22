"use client";

import React, { useState } from "react";
import SwipeCard from "@/components/SwipeCard";
import { dummyData } from "@/lib/dummy";
import DynamicWallet from "@/components/DynamicWallet";

type Props = {};

const Round = (props: Props) => {
  const [currentCard, setCurrentCard] = useState(0);

  return (
    <>
      <div className="relative flex h-screen flex-col">
        <div className="mt-8 flex items-center justify-between px-6">
          <h1 className="text-4xl font-bold text-primary">QIVE</h1>
          <DynamicWallet />
        </div>
        <div className="relative my-6 flex grow justify-center">
          {currentCard >= dummyData.length ? (
            <div>No more issues</div>
          ) : (
            dummyData.map((data, index) => (
              <SwipeCard
                key={index}
                content={{ ...data, index }}
                afterSwipe={(data) => {
                  setCurrentCard(currentCard + 1);
                }}
              />
            ))
          )}
        </div>
        <div className="mb-8 text-center text-sm text-neutral-900">
          {Math.min(currentCard + 1, dummyData.length)}/{dummyData.length}
        </div>
      </div>
    </>
  );
};

export default Round;
