"use client";

import { useAccount, useWalletClient } from "wagmi";
import { sepolia, arbitrumSepolia, holesky, baseSepolia } from "wagmi/chains";
import { useWriteContract } from "wagmi";
import ETHBridge from "@/utils/abi/EthBridge.sol/EthBridge.json";
import { hexZeroPadTo32, Options } from "@layerzerolabs/lz-v2-utilities";

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
import { toast } from "sonner";
import { useState, useEffect } from "react";
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
import { readContract } from "viem/actions";
import { Client, parseEther } from "viem";
import {
  useDynamicContext,
  useRpcProviders,
} from "@dynamic-labs/sdk-react-core";
import { evmProvidersSelector } from "@dynamic-labs/ethereum-core";
import DynamicWallet from "@/components/DynamicWallet";

type Props = {};

const FormSchema = z.object({
  amount: z.string(),
});

const Stake = (props: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { address, chainId } = useAccount();
  const { data: client, isFetched } = useWalletClient();

  const { writeContract } = useWriteContract();

  const { defaultProvider } = useRpcProviders(evmProvidersSelector);
  const { primaryWallet, network } = useDynamicContext();
  const [step, setStep] = useState(0);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);

    console.log("address");

    const _amount = parseEther(data.amount);

    toast.info("Staking...");

    try {
      const receiverAddressInBytes32 = hexZeroPadTo32(primaryWallet as unknown as string);

      let EID = 0;
      let ethBrigde = "";

      let holeskyEID = 40217;

      if (chainId === sepolia.id) {
        ethBrigde = "0xc5C89151AF3cE858bdECE60d24D20D23d611210a";
        EID = 40161;
      } else if (chainId === arbitrumSepolia.id) {
        ethBrigde = "0x00Ab0839BFE0c17716A015e36350b49e0bDf0feF";
        EID = 40231;
      } else if (chainId === baseSepolia.id) {
        ethBrigde = "0xa61Bc9c98a1486E5496078b30579f0A3af4c6929";
        EID = 40245;
      } else if (chainId === holesky.id) {
        EID = 40217;
        ethBrigde = "0x6527800Ef9f9c0772e064F5302592A354b1D07Cc";
      }

      // Define the options using lzNativeDrop and lzReceiveOption
      const options = Options.newOptions()
        .addExecutorNativeDropOption(_amount, receiverAddressInBytes32) // Native Drop option
        .addExecutorLzReceiveOption(500000, 0)
        .toHex()
        .toString();

      console.log(options);

      
      if(chainId !== holesky.id) {
        toast.info("Bridging...");

        // Quote the bridge fee
        const result = await readContract(client as Client, {
          abi: ETHBridge.abi,
          address: "0x6b175474e89094c44da98b954eedeac495271d0f",
          functionName: "quoteBridgeFee",
          args: [holeskyEID, _amount, options, false],
        });
  
        console.log(
          "Estimated native fee for the bridge include bridge amount:",
          result
        );


        const nativeFee = (result as unknown as any).nativeFee;


        writeContract({
          abi: ETHBridge.abi,
          address: ethBrigde as `0x${string}`,
          functionName: "bridgeETH",
          args: [
            EID,
            ethBrigde,
            {
              value: nativeFee,
              gasLimit: 500000, // Adjust gas limit as needed
            },
          ],
        }, {
          onSuccess: () => {
            toast.success("Stake successful", {
              description: "You have successfully staked your tokens.",
            });
          },
          onError: (error: any) => {
            console.error(error);
            toast.error("Error",{
              description: "An error occurred while staking.",
            });
          }
        });
      }


      writeContract(
        {
          abi: ETHBridge.abi,
          address: "0xb03A1229B8B71cD5C97Abd10BE0238700970a770",
          functionName: "deposit",
          args: [primaryWallet],
          value: _amount,
        },
        {
          onSuccess: () => {
            toast.success("Stake successful", {
              description: "You have successfully staked your tokens.",
            });
          },
          onError: (error: any) => {
            console.error(error);
            toast.error("Error",{
              description: "An error occurred while staking.",
            });
          },
        }
      );

      // router.push("/stake/detail" + "?" + searchParams.toString());
    } catch (error) {
      console.error(error);
    } 
    
    // temporary demo
    finally {
      setTimeout(() => {
        router.push("/round" + "?" + searchParams.toString());
      }, 1000)
    }
  }

  function nextStep() {
    setStep((prev: number) => prev + 1);
  }

  useEffect(() => {
    console.log("network", network);
    console.log("primaryWallet", primaryWallet);
  }, [network,primaryWallet]);

  // if (!primaryWallet || !isEthereumWallet(primaryWallet)) return null;

  return (
    <div className="relative flex h-screen flex-col">
        <div className="mt-8 flex items-center justify-between px-6">
          <h1 className="text-4xl font-bold text-primary">QIVE</h1>
          <DynamicWallet />
        </div>
        <div className="relative my-6 flex grow justify-center">
          <div className="">
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
                        // disabled={parseInt(form.getValues("amount")) <= 0}
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
        </div>
    </div>
  );
};

export default Stake;
