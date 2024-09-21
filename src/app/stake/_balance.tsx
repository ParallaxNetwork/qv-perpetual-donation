import { CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const shortAddress = (address: string) =>
  address.slice(0, 6) + "..." + address.slice(-4);

type CardProps = React.ComponentProps<typeof Card>;

const FormSchema = z.object({
  tnc: z.boolean().default(false).optional(),
});

export function DetailSake({ className, nextStep, ...props }: CardProps) {
  const toast = useToast();
  const [balance, setBalance] = useState(0.1);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tnc: false,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Card className={cn("", className)} {...props}>
      <CardHeader>
        <CardTitle className="text-2xl">Stake</CardTitle>
        <CardDescription>
          The following conditions must be met to proceed.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* <div className=" flex items-center space-x-4 rounded-md border p-4">
          <BellIcon />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Push Notifications
            </p>
            <p className="text-sm text-muted-foreground">
              Send notifications to device.
            </p>
          </div>
        </div> */}
        <div>
          <div className="mb-4 grid grid-cols-1 items-start pb-4 gap-2">
            <div className="space-x-1 flex justify-between">
              <p className="text-sm font-medium leading-none">Wallet</p>
              <p className="text-sm text-muted-foreground">
                {shortAddress("0x93fcd50dDE7a48473c478bb05603F4090FcB5799")}
              </p>
            </div>
            <div className="space-x-1 flex justify-between">
              <p className="text-sm font-medium leading-none">Network</p>
              <p className="text-sm text-muted-foreground">Base Chain</p>
            </div>
            <div className="space-x-1 flex justify-between">
              <p className="text-sm font-medium leading-none">ETH Available</p>
              <p className="text-sm text-muted-foreground">{balance} ETH</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="tnc"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I fully understand and agree with all policies.
                    </FormLabel>
                    {/* <FormDescription>
                      You can manage your mobile notifications in the{" "}
                      <Link href="/examples/forms">mobile settings</Link> page.
                    </FormDescription> */}
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          disabled={!form.getValues("tnc") || balance <= 0}
          onClick={nextStep}
          className="w-full"
        >
          <CheckIcon className="mr-2 h-4 w-4" /> Next
        </Button>
      </CardFooter>
    </Card>
  );
}
