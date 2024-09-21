"use client";

import { motion, useAnimation } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { XIcon, CheckIcon, DollarSignIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface SwipeCardProps {
  content: {
    index: number;
    name: string;
    description: string;
    image: string;
  };
  afterSwipe?: ({ index, vote }: { index: number; vote: number }) => void;
}

const FormSchema = z.object({
  amount: z.string(),
});

const SwipeCard: React.FC<SwipeCardProps> = ({ content, afterSwipe }) => {
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [cardWidth, setCardWidth] = useState<number>(0);
  const [dragging, setDragging] = useState(false);
  const [allowScroll, setAllowScroll] = useState(false);
  const [isPledging, setIsPledging] = useState(false);

  useEffect(() => {
    const contentDiv = contentRef.current;
    if (allowScroll && contentDiv) {
      const handleTouch = (event: any) => {
        event.stopPropagation();
      };
      contentDiv.addEventListener("touchmove", handleTouch);
      return () => {
        contentDiv.removeEventListener("touchmove", handleTouch);
      };
    }
  }, [allowScroll]);

  // Function to animate the swipe
  const swipe = (direction: "left" | "right") => {
    controls
      .start({
        x: direction === "right" ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.5 },
      })
      .then(() => {
        setIsVisible(false);
        if (afterSwipe)
          afterSwipe({
            index: content.index,
            vote: direction === "right" ? 1 : 0,
          });
      });
  };

  const handleDragStart = (_: any, info: any) => {
    setDragging(true);
    setAllowScroll(Math.abs(info.delta.y) > Math.abs(info.delta.x));
  };

  const handleDragEnd = (event: any, info: any) => {
    const thresholdX = cardWidth * 0.75;

    if (info.offset.x > thresholdX) {
      swipe("right");
    } else if (info.offset.x < -thresholdX) {
      swipe("left");
    } else {
      controls.start({
        x: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
        },
      });
    }

    setDragging(false);
  };

  // Get the card's width dynamically
  useEffect(() => {
    if (cardRef.current) {
      setCardWidth(cardRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    console.log("dragging", dragging);
  }, [dragging]);

  return isVisible ? (
    <>
      <motion.div
        ref={cardRef}
        className="absolute flex h-full w-full select-none flex-col justify-center overflow-hidden rounded-3xl bg-white shadow-sm"
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -300, right: 300 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        initial={{ x: 0, opacity: 1 }}
        animate={controls}
      >
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto text-neutral-900"
        >
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src={content.image}
              sizes="100%"
              alt=""
              fill={true}
              className="object-cover object-center"
            />
          </div>

          <div className="px-10 py-6">
            <h2 className="mb-4 text-2xl font-bold">{content.name}</h2>
            <p className="text-justify">{content.description}</p>

            {/* Buttons for Like and Dislike */}
            <div className="mt-8 flex justify-between">
              <button
                className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow"
                onClick={() => swipe("left")}
              >
                <XIcon className="size-8" />
              </button>
              <button
                className="flex size-20 items-center justify-center rounded-full bg-primary text-white shadow"
                onClick={() => setIsPledging(true)}
              >
                <DollarSignIcon className="size-10" />
              </button>
              <button
                className="flex size-14 items-center justify-center rounded-full border-2 bg-primary text-white shadow"
                onClick={() => swipe("right")}
              >
                <CheckIcon className="size-8" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      <PledgeForm
        show={isPledging}
        onShowChange={setIsPledging}
        onPledge={() => {
          setIsPledging(false);
          swipe("right");
        }}
      />
    </>
  ) : null;
};

export default SwipeCard;

function PledgeForm({
  show,
  onShowChange,
  onPledge,
}: {
  show: boolean;
  onShowChange: (show: boolean) => void;
  onPledge: () => void;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);

    const toastId = toast.loading("Pledging...");

    try {
      // hit stake contract
      setTimeout(() => {
        toast.success("Pledge successful", {
          id: toastId,
          description: "You have successfully staked your tokens.",
        });
        onPledge();
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Dialog open={show} onOpenChange={() => onShowChange(false)}>
      <DialogContent className="rounded-xl bg-white">
        <DialogHeader>
          <DialogClose onClick={() => onShowChange(false)} />
          <DialogTitle className="text-black">Pledge to continue</DialogTitle>
          <DialogDescription>
            The following conditions must be met to proceed.
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="grid gap-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-2 space-y-6 text-sm"
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Input amount you want to stake"
                          {...field}
                        />
                      </FormControl>
                      {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={parseInt(form.getValues("amount")) <= 0}
                  type="submit"
                  className="w-full"
                >
                  Pledge
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
