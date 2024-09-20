import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Contract, ContractFactory } from 'ethers';
import { deployments, ethers } from 'hardhat';

import { Options } from '@layerzerolabs/lz-v2-utilities';

describe('EthBridge Test', function () {
    // Constants representing mock Endpoint IDs for testing purposes
    const eidA = 1;
    const eidB = 2;

    // Declaration of variables to be used in the test suite
    let EthBridge: ContractFactory;
    let EndpointV2Mock: ContractFactory;
    let ownerA: SignerWithAddress;
    let ownerB: SignerWithAddress;
    let endpointOwner: SignerWithAddress;
    let ethBridgeA: Contract;
    let ethBridgeB: Contract;
    let mockEndpointV2A: Contract;
    let mockEndpointV2B: Contract;

    // Before hook for setup that runs once before all tests in the block
    before(async function () {
        // Contract factory for our tested contract
        EthBridge = await ethers.getContractFactory('EthBridge');

        // Fetching the first three signers (accounts) from Hardhat's local Ethereum network
        const signers = await ethers.getSigners();
        ownerA = signers.at(0)!;
        ownerB = signers.at(1)!;
        endpointOwner = signers.at(2)!;

        // Fetch the mock EndpointV2 contract (LayerZero's mock for local testing)
        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock');
        EndpointV2Mock = new ContractFactory(EndpointV2MockArtifact.abi, EndpointV2MockArtifact.bytecode, endpointOwner);
    });

    // beforeEach hook for setup that runs before each test in the block
    beforeEach(async function () {
        // Deploying a mock LZ EndpointV2 with the given Endpoint ID
        mockEndpointV2A = await EndpointV2Mock.deploy(eidA);
        mockEndpointV2B = await EndpointV2Mock.deploy(eidB);

        // Deploying two instances of EthBridge contract and linking them to the mock LZEndpoint
        ethBridgeA = await EthBridge.deploy(mockEndpointV2A.address, ownerA.address);
        ethBridgeB = await EthBridge.deploy(mockEndpointV2B.address, ownerB.address);

        // Setting destination endpoints in the LZEndpoint mock for each EthBridge instance
        await mockEndpointV2A.setDestLzEndpoint(ethBridgeB.address, mockEndpointV2B.address);
        await mockEndpointV2B.setDestLzEndpoint(ethBridgeA.address, mockEndpointV2A.address);

        // Setting each EthBridge instance as a peer of the other
        await ethBridgeA.connect(ownerA).setPeer(eidB, ethers.utils.zeroPad(ethBridgeB.address, 32));
        await ethBridgeB.connect(ownerB).setPeer(eidA, ethers.utils.zeroPad(ethBridgeA.address, 32));
    });

    it('should bridge ETH from one contract to another with lzNativeDrop option', async function () {
    // Set the initial state: both contracts and the receiver should have no ETH bridged initially
    expect((await ethers.provider.getBalance(ethBridgeA.address)).toBigInt()).to.be.eq(BigInt(0));
    expect((await ethers.provider.getBalance(ethBridgeB.address)).toBigInt()).to.be.eq(BigInt(0));

    // Define the receiver address on the destination chain (ownerB in this case)
    const receiver = ownerB.address;
    const receiverAddressInBytes32 = ethers.utils.hexZeroPad(ethers.utils.getAddress(receiver), 32);
    console.log("receiverAddressInBytes32: " + receiverAddressInBytes32.toString());

    // Define the amount of ETH to bridge (0.1 ETH in this example)
    const bridgeAmount = ethers.utils.parseEther('0.1');
    
    // Define options for the LayerZero message using the lzNativeDrop option
    const options = Options.newOptions()
        .addExecutorNativeDropOption(bridgeAmount.toBigInt(), receiverAddressInBytes32.toString())
        .addExecutorLzReceiveOption(200000, 0)
        .toHex()
        .toString();

    

    // Native fee for the LayerZero message (mocked here as zero for simplicity)
    let nativeFee = 0;
    [nativeFee] = await ethBridgeA.quoteBridgeFee(eidB, bridgeAmount, options, false);

    // Get the initial balance of ownerA (sender) and ownerB (receiver) to track balances
    const initialOwnerABalance = await ethers.provider.getBalance(ownerA.address);
    const initialReceiverBalance = await ethers.provider.getBalance(ownerB.address);

    // Execute the bridge operation from ethBridgeA, sending ETH using lzNativeDrop
    const tx = await ethBridgeA.bridgeETH(eidB, bridgeAmount, options, { value: (BigNumber.from(nativeFee)) });
    const txReceipt = await tx.wait();

    // Verify that ethBridgeA no longer holds any ETH (since it has been bridged out)
    expect((await ethers.provider.getBalance(ethBridgeA.address)).toBigInt()).to.be.eq(BigInt(0));

    // Verify that the receiver (ownerB) has received the bridged ETH on the destination side
    const finalReceiverBalance = await ethers.provider.getBalance(ownerB.address);
    console.log("initialReceiverBalance: " + initialReceiverBalance.toBigInt());
    console.log("finalReceiverBalance: " + finalReceiverBalance.toBigInt());
    console.log("bridgeAmount: " + bridgeAmount.toBigInt());
    expect((finalReceiverBalance.sub(initialReceiverBalance)).toBigInt()).to.be.eq(bridgeAmount.toBigInt());

    // Simulate balance decrease for ownerA due to bridging (considering gas usage)
    const finalOwnerABalance = await ethers.provider.getBalance(ownerA.address);
    console.log("initialOwnerABalance: " + initialOwnerABalance.toBigInt());
    console.log("finalOwnerABalance: " + finalOwnerABalance.toBigInt());

    // Calculate the amount spent including gas
    const gasUsed = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);
    const expectedFinalBalance = initialOwnerABalance.sub(gasUsed.add(nativeFee));
    console.log("fees: ", BigNumber.from(nativeFee).toBigInt());  
    console.log("gasUsed: ", (gasUsed.toBigInt()));
    console.log("expectedFinalBalance: " + expectedFinalBalance.toBigInt());
    

    // Ensure that ownerA's balance has decreased by the right amount (sent ETH + gas fees)
    expect(finalOwnerABalance.toBigInt()).to.be.eq(expectedFinalBalance.toBigInt()); // Allow small margin for gas variations
});

    

    // Additional test cases can be added to test edge cases, failures, or additional logic.
});
