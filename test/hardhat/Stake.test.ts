import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Contract, ContractFactory } from 'ethers';
import { deployments, ethers } from 'hardhat';

import { Options } from '@layerzerolabs/lz-v2-utilities';

async function main() {
    // Network settings
    const sepoliaEID = 40161;   // Sepolia EID
    const basesepEID = 40245;   // BaseSep
    const arbsepEID = 40231;   // ArbSep
    const holeskyEID = 40217;   // Holesky EID
    const stakeBridgeAddress = '0x79Dac6AAaec280C22BF7705454C62FC5681190c9';
    const donationManagerAddress = '0xb03A1229B8B71cD5C97Abd10BE0238700970a770'; // Holesky EthBridge address
    const lzEndpoint = '0x6EDCE65403992e310A62460808c4b910D972f10f'; // LZ endpoint
    const lidoAddress = '0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034';


    // Sender and Receiver setup
    const [deployer] = await ethers.getSigners();
    console.log("account:", deployer.address);

    // cross-chain
    let StakeBridge;
    try{
        StakeBridge = await ethers.getContractAt('StakeBridge', stakeBridgeAddress);
        console.log("StakeBridge:", StakeBridge.address);
    }
    catch(e){
        console.log("StakeBridge not deployed");
    }
    

    // Specify the receiver address on Holesky (same as deployer for this example)
    const receiver = donationManagerAddress;
    const receiverAddressInBytes32 = ethers.utils.hexZeroPad(ethers.utils.getAddress(receiver), 32);

    const bridgeAmount = ethers.utils.parseEther('0.1');

    // Define the options using lzNativeDrop and lzReceiveOption
    const options = Options.newOptions()
        .addExecutorNativeDropOption(bridgeAmount.toBigInt(), receiverAddressInBytes32) // Native Drop option
        .addExecutorLzReceiveOption(500000, 0)
        .toHex()
        .toString();

    // Quote the bridge fee
    const { nativeFee } = await StakeBridge.quoteBridgeFee(holeskyEID, bridgeAmount, options, false);
    console.log("Estimated native fee for the bridge include bridge amount:", nativeFee.toString());

    // Execute the bridge operation from Sepolia to Holesky
    const tx = await deployer.sendTransaction({
        to: stakeBridgeAddress,
        value: nativeFee + ethers.utils.parseEther('0.003'),
        gasLimit: 1000000
    });

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log(`Bridge transaction successful. Tx hash: ${receipt.transactionHash}`);

    // Check the balance of the receiver on Holesky after the bridge
    console.log(`Check Holesky contract.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
