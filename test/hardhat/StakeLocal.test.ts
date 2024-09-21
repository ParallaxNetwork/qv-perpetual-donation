import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Contract, ContractFactory } from 'ethers';
import { deployments, ethers } from 'hardhat';

import { Options } from '@layerzerolabs/lz-v2-utilities';

describe('StakeBridge Test', function () {
    // Constants representing mock Endpoint IDs for testing purposes
    const eidA = 1;
    const eidB = 40217;

    // Declaration of variables to be used in the test suite
    let StakeBridge: ContractFactory;
    let DonationManager: ContractFactory;
    let EndpointV2Mock: ContractFactory;
    let ownerA: SignerWithAddress;
    let ownerB: SignerWithAddress;
    let endpointOwner: SignerWithAddress;
    let StakeBridgeA: Contract;
    let DonationManagerB: Contract;
    let mockEndpointV2A: Contract;
    let mockEndpointV2B: Contract;

    // Before hook for setup that runs once before all tests in the block
    before(async function () {
        // Contract factory for our tested contract
        StakeBridge = await ethers.getContractFactory('StakeBridge');
        DonationManager = await ethers.getContractFactory('DonationManager');

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
        DonationManagerB = await DonationManager.deploy('0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034', '0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034', mockEndpointV2B.address, ownerB.address);
        StakeBridgeA = await StakeBridge.deploy(mockEndpointV2A.address, ownerA.address, DonationManagerB.address, eidA);

        // Setting destination endpoints in the LZEndpoint mock for each EthBridge instance
        await mockEndpointV2A.setDestLzEndpoint(DonationManagerB.address, mockEndpointV2B.address);
        await mockEndpointV2B.setDestLzEndpoint(StakeBridgeA.address, mockEndpointV2A.address);

        // Setting each EthBridge instance as a peer of the other
        await StakeBridgeA.connect(ownerA).setPeer(eidB, ethers.utils.zeroPad(DonationManagerB.address, 32));
        await DonationManagerB.connect(ownerB).setPeer(eidA, ethers.utils.zeroPad(StakeBridgeA.address, 32));
    });

    it('should bridge ETH from one contract to another with lzNativeDrop option', async function () {
        // Set the initial state: both contracts and the receiver should have no ETH bridged initially
        expect((await ethers.provider.getBalance(StakeBridgeA.address)).toBigInt()).to.be.eq(BigInt(0));
        expect((await ethers.provider.getBalance(DonationManagerB.address)).toBigInt()).to.be.eq(BigInt(0));

        // Define the receiver address on the destination chain (ownerB in this case)
        const receiver = DonationManagerB.address;
        const receiverAddressInBytes32 = ethers.utils.hexZeroPad(ethers.utils.getAddress(receiver), 32);
        console.log("receiverAddressInBytes32: " + receiverAddressInBytes32.toString());

        const bridgeAmount = ethers.utils.parseEther('0.01');

        // Define the options using lzNativeDrop and lzReceiveOption
        const options = Options.newOptions()
            .addExecutorNativeDropOption(bridgeAmount.toBigInt(), receiverAddressInBytes32) // Native Drop option
            .addExecutorLzReceiveOption(500000, 0)
            .toHex()
            .toString();

        // Quote the bridge fee
        const { nativeFee } = await StakeBridgeA.quoteBridgeFee(eidB, bridgeAmount, options, false);
        console.log("Estimated native fee for the bridge include bridge amount:", nativeFee.toString());

        // Execute the bridge operation from Sepolia to Holesky
        const tx = await ownerA.sendTransaction({
            to: StakeBridgeA.address,
            value: nativeFee,
            gasLimit: 800000
        });

        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log(`Bridge transaction successful. Tx hash: ${receipt.transactionHash}`);
    });

    

    // Additional test cases can be added to test edge cases, failures, or additional logic.
});
