"use client";

import { createConfig } from "wagmi";
import { QueryClient } from "@tanstack/react-query";
import { http } from "viem";
import { sepolia, arbitrumSepolia, baseSepolia, holesky } from "viem/chains";

export const config = createConfig({
  chains: [sepolia, arbitrumSepolia, baseSepolia, holesky],
  multiInjectedProviderDiscovery: false,
  transports: {
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [baseSepolia.id]: http(),
    [holesky.id]: http(),
  },
});

export const queryClient = new QueryClient();
