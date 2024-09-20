import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Contract, ContractFactory } from 'ethers';
import { deployments, ethers } from 'hardhat';

import { Options } from '@layerzerolabs/lz-v2-utilities';

async function main() {
    // Network settings
    const sepoliaEID = 40161;   // Sepolia EID
    const holeskyEID = 40217;   // Holesky EID
    const sepoliaBridgeAddress = '0xc5C89151AF3cE858bdECE60d24D20D23d611210a'; // Sepolia EthBridge address
    const holeskyBridgeAddress = '0x6527800Ef9f9c0772e064F5302592A354b1D07Cc'; // Holesky EthBridge address
    const lzEndpointSepolia = '0x6EDCE65403992e310A62460808c4b910D972f10f'; // Sepolia LZ endpoint
    const lzEndpointHolesky = '0x6EDCE65403992e310A62460808c4b910D972f10f'; // Holesky LZ endpoint

    // Sender and Receiver setup
    const [deployer] = await ethers.getSigners();
    console.log("account:", deployer.address);

    // Connect to the EthBridge contract on Sepolia
    const EthBridgeSepolia = await ethers.getContractAt('EthBridge', sepoliaBridgeAddress);

    // Specify the receiver address on Holesky (same as deployer for this example)
    const receiver = deployer.address;
    const receiverAddressInBytes32 = ethers.utils.hexZeroPad(ethers.utils.getAddress(receiver), 32);

    const bridgeAmount = ethers.utils.parseEther('0.01');

    // Define the options using lzNativeDrop and lzReceiveOption
    const options = Options.newOptions()
        .addExecutorNativeDropOption(bridgeAmount.toBigInt(), receiverAddressInBytes32) // Native Drop option
        .addExecutorLzReceiveOption(500000, 0)
        .toHex()
        .toString();

    

    // Quote the bridge fee
    const { nativeFee } = await EthBridgeSepolia.quoteBridgeFee(holeskyEID, bridgeAmount, options, false);
    console.log("Estimated native fee for the bridge include bridge amount:", nativeFee.toString());

    // Execute the bridge operation from Sepolia to Holesky
    const tx = await EthBridgeSepolia.bridgeETH(holeskyEID, bridgeAmount, options, {
        value: nativeFee,
        gasLimit: 500000 // Adjust gas limit as needed
    });

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log(`Bridge transaction successful. Tx hash: ${receipt.transactionHash}`);

    // Check the balance of the receiver on Holesky after the bridge
    console.log(`Check the receiver's balance on Holesky manually to confirm the ETH drop.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
