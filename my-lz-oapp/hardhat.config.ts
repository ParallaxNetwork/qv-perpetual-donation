/* eslint-disable prettier/prettier */
// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'
import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'

import { EndpointId } from '@layerzerolabs/lz-definitions'

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY as string
console.log(PRIVATE_KEY);


const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        compilers: [
            {
                version: '0.8.22', 
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        'sepolia-testnet': {
            eid: EndpointId.SEPOLIA_V2_TESTNET,
            url: process.env.RPC_URL_SEPOLIA as string || 'https://rpc.sepolia.org/',
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : undefined,
        },
        // 'avalanche-testnet': {
        //     eid: EndpointId.AVALANCHE_V2_TESTNET,
        //     url: process.env.RPC_URL_FUJI || 'https://rpc.ankr.com/avalanche_fuji',
        //     accounts: PRIVATE_KEY ? [PRIVATE_KEY] : undefined,
        // },
        // 'amoy-testnet': {
        //     eid: EndpointId.AMOY_V2_TESTNET,
        //     url: process.env.RPC_URL_AMOY || 'https://polygon-amoy-bor-rpc.publicnode.com',
        //     accounts: PRIVATE_KEY ? [PRIVATE_KEY] : undefined,
        // },
        'holesky-testnet': {
            eid: EndpointId.HOLESKY_V2_TESTNET,
            url: process.env.RPC_URL_HOLESKY as string,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : undefined,
        },
        'arbsep-testnet': {
            eid: EndpointId.ARBSEP_V2_TESTNET,
            url: process.env.RPC_URL_ARB_SEP as string,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : undefined,
        },
        'basesep-testnet': {
            eid: EndpointId.BASESEP_V2_TESTNET,
            url: process.env.RPC_URL_BASE_SEP as string,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : undefined,
        }
    },
    namedAccounts: {
        deployer: {
            default: 0, // wallet address of index[0], of the mnemonic in .env
            'sepolia-testnet':  `privatekey://${process.env.PRIVATE_KEY}`,
            'holesky-testnet':  `privatekey://${process.env.PRIVATE_KEY}`,
            'arbsep-testnet':  `privatekey://${process.env.PRIVATE_KEY}`,
            'basesep-testnet':  `privatekey://${process.env.PRIVATE_KEY}`,
        },
    },
}

export default config
