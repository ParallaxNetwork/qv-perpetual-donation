import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";

type Props = {};

const StakeDetail = (props: Props) => {
  return (
    <Card className={cn("")} {...props}>
      <CardHeader>
        <CardTitle className="text-2xl">Stake to continue</CardTitle>
        <CardDescription>
          The following conditions must be met to proceed.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <div className="mb-4 grid grid-cols-1 items-start pb-4 gap-2">
            <div className="space-x-1 flex justify-between">
              <p className="text-sm font-medium leading-none">Staked Amount</p>
              <p className="text-sm text-muted-foreground">12 ETH</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StakeDetail;
