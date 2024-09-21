"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DetailSake } from "./_balance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {};

const FormSchema = z.object({
  amount: z.string(),
});

const Stake = (props: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);

    toast({ title: "Staking..." });

    try {
      // hit stake contract
      setTimeout(() => {
        toast({
          title: "Stake successful",
          description: "You have successfully staked your tokens.",
        });
      }, 2000);

      router.push("/stake/detail" + "?" + searchParams.toString());
    } catch (error) {
      console.error(error);
    }
  }

  function nextStep() {
    setStep((prev: number) => prev + 1);
  }

  return (
    <div className="px-3 py-6">
      {step === 0 ? (
        <DetailSake nextStep={nextStep} />
      ) : (
        <Card className={cn("")} {...props}>
          <CardHeader>
            <CardTitle className="text-2xl">Stake to continue</CardTitle>
            <CardDescription>
              The following conditions must be met to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 text-sm mt-2"
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
                  Stake
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Stake;
