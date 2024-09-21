import { EndpointId } from "@layerzerolabs/lz-definitions";
const arbsep_testnetContract = {
  eid: EndpointId.ARBSEP_V2_TESTNET,
  contractName: "StakeBridge",
};
const basesep_testnetContract = {
  eid: EndpointId.BASESEP_V2_TESTNET,
  contractName: "StakeBridge",
};
const holesky_testnetContract = {
  eid: EndpointId.HOLESKY_V2_TESTNET,
  contractName: "DonationManager",
};
const sepolia_testnetContract = {
  eid: EndpointId.SEPOLIA_V2_TESTNET,
  contractName: "StakeBridge",
};
export default {
  contracts: [
    { contract: arbsep_testnetContract },
    { contract: basesep_testnetContract },
    { contract: holesky_testnetContract },
    { contract: sepolia_testnetContract },
  ],
  connections: [
    {
      from: arbsep_testnetContract,
      to: holesky_testnetContract,
      config: {
        sendLibrary: "0x4f7cd4DA19ABB31b0eC98b9066B9e857B1bf9C0E",
        receiveLibraryConfig: {
          receiveLibrary: "0x75Db67CDab2824970131D5aa9CECfC9F69c69636",
          gracePeriod: 0,
        },
        sendConfig: {
          executorConfig: {
            maxMessageSize: 10000,
            executor: "0x5Df3a1cEbBD9c8BA7F8dF51Fd632A9aef8308897",
          },
          ulnConfig: {
            confirmations: 1,
            requiredDVNs: ["0x53f488E93b4f1b60E8E83aa374dBe1780A1EE8a8"],
            optionalDVNs: [],
            optionalDVNThreshold: 0,
          },
        },
        receiveConfig: {
          ulnConfig: {
            confirmations: 1,
            requiredDVNs: ["0x53f488E93b4f1b60E8E83aa374dBe1780A1EE8a8"],
            optionalDVNs: [],
            optionalDVNThreshold: 0,
          },
        },
      },
    },
    {
      from: basesep_testnetContract,
      to: holesky_testnetContract,
      config: {
        sendLibrary: "0xC1868e054425D378095A003EcbA3823a5D0135C9",
        receiveLibraryConfig: {
          receiveLibrary: "0x12523de19dc41c91F7d2093E0CFbB76b17012C8d",
          gracePeriod: 0,
        },
        sendConfig: {
          executorConfig: {
            maxMessageSize: 10000,
            executor: "0x8A3D588D9f6AC041476b094f97FF94ec30169d3D",
          },
          ulnConfig: {
            confirmations: 1,
            requiredDVNs: ["0xe1a12515F9AB2764b887bF60B923Ca494EBbB2d6"],
            optionalDVNs: [],
            optionalDVNThreshold: 0,
          },
        },
        receiveConfig: {
          ulnConfig: {
            confirmations: 1,
            requiredDVNs: ["0xe1a12515F9AB2764b887bF60B923Ca494EBbB2d6"],
            optionalDVNs: [],
            optionalDVNThreshold: 0,
          },
        },
      },
    },
    {
      from: sepolia_testnetContract,
      to: holesky_testnetContract,
      config: {
        sendLibrary: "0xcc1ae8Cf5D3904Cef3360A9532B477529b177cCE",
        receiveLibraryConfig: {
          receiveLibrary: "0xdAf00F5eE2158dD58E0d3857851c432E34A3A851",
          gracePeriod: 0,
        },
        sendConfig: {
          executorConfig: {
            maxMessageSize: 10000,
            executor: "0x718B92b5CB0a5552039B593faF724D182A881eDA",
          },
          ulnConfig: {
            confirmations: 2,
            requiredDVNs: ["0x8eebf8b423B73bFCa51a1Db4B7354AA0bFCA9193"],
            optionalDVNs: [],
            optionalDVNThreshold: 0,
          },
        },
        receiveConfig: {
          ulnConfig: {
            confirmations: 1,
            requiredDVNs: ["0x8eebf8b423B73bFCa51a1Db4B7354AA0bFCA9193"],
            optionalDVNs: [],
            optionalDVNThreshold: 0,
          },
        },
      },
    },
  ],
};
