// should be in FE logic

require('dotenv').config();
const { ethers } = require('ethers');
const { Web3 } = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL_HOLESKY));
console.log(web3);
const {
    LidoSDK,
    LidoSDKCore,
    StakeStageCallback,
    TransactionCallbackStage,
    SDKError
} = require('@lidofinance/lido-ethereum-sdk');

// Wallet setup
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
const address = wallet.address;

// Initialize LidoSDK with the provider and signer
const lidoSDK = new LidoSDK({
    chainId: 17000,
    rpcUrls: [process.env.RPC_URL_HOLESKY],
    web3Provider: web3,
});

console.log(lidoSDK.web3Provider);

async function main() {
    // Step 1: Stake ETH via LidoSDK
    const stakeAmount = ethers.parseEther("0.001");

    console.log("Staking 0.001 ETH via Lido...");

    const balanceETH = await lidoSDK.core.balanceETH(address);
    console.log(balanceETH.toString(), 'ETH initial balance');
    // Optional: Define callbacks for staking process stages
    const stakeStageCallback = (stage) => {
        if (stage === StakeStageCallback.STAGE_SUBMITTED) {
            console.log('Stake transaction submitted.');
        }
    };

    const txCallback = (stage) => {
        if (stage === TransactionCallbackStage.STAGE_MINED) {
            console.log('Transaction mined.');
        }
    };

    const stakeTx = await lidoSDK.stake.stakeEth({
        amount: stakeAmount,  // Amount to stake in ETH
        referral: "",  // Optionally pass your referral address
    });

    console.log(`Stake transaction submitted. Tx hash: ${stakeTx.hash}`);
    await stakeTx.wait();

    // relevant results are returned with transaction
    const { stethReceived, sharesReceived } = stakeTx.result;
    console.log(`Stake successful: Received ${stethReceived} stETH and ${sharesReceived} shares.`);

    const newBalanceETH = await lidoSDK.core.balanceETH(address);
    console.log(newBalanceETH.toString(), 'ETH new balance');

    // Step 2: Getting stETH APR
    const lastApr = await lidoSDK.statistics.apr.getLastApr();
    const smaApr = await lidoSDK.statistics.apr.getSmaApr({ days: 7 });

    console.log(lastApr, 'last apr');
    console.log(smaApr, 'sma apr by 7 days');

    const balanceShares = await lidoSDK.shares.balance(address);
    console.log(balanceShares.toString(), 'shares balance');
    console.log("In stETH: ", await lidoSDK.convertToSteth(balanceShares));

    // Step 3: Convert stETH to ETH equivalent using exchange rate
    const shareRate = await lidoSDK.getShareRate();
    console.log(shareRate.toString(), 'share rate');
    console.log("Your stETH is worth approximately: ", shareRate * stethReceived);

    // Step 4: Request withdrawal
}

main().catch((error) => {
    console.error("Error in script:", error);
});
