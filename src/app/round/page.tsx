"use client";

import React, { useState } from "react";
import SwipeCard from "@/components/SwipeCard";
import { dummyData } from "@/lib/dummy";

type Props = {};

const Round = (props: Props) => {
  const [currentCard, setCurrentCard] = useState(0);

  return (
    <>
      <div className="relative flex h-screen flex-col">
        <h1 className="mt-8 text-center text-4xl font-bold text-primary">
          QIVE
        </h1>
        <div className="relative my-6 flex grow justify-center">
          {currentCard >= dummyData.length ? (
            <div>No more issues</div>
          ) : (
            dummyData.reverse().map((data, index) => (
              <SwipeCard
                key={index}
                content={data}
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
