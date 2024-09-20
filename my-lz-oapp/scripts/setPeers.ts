const { ethers } = require('hardhat');

async function main() {
    const sepoliaEID = 40161;
    const arbsepEID = 40231;
    const basesepEID = 40245;
    const holeskyEID = 40217;

    const deployerAddress = '0x4829eFeBC90032bdf5e943ba069eE8e9d2634e09';

    const contractAddresses = {
        sepolia: '0xc5C89151AF3cE858bdECE60d24D20D23d611210a',
        arbsep: '0x00Ab0839BFE0c17716A015e36350b49e0bDf0feF',
        basesep: '0xa61Bc9c98a1486E5496078b30579f0A3af4c6929',
        holesky: '0x6527800Ef9f9c0772e064F5302592A354b1D07Cc'
    };

    const [deployer] = await ethers.getSigners();
    console.log("Setting peers with the account:", deployer.address);

    
    // Set peers for all chains
    console.log("Setting peers...");

    // // Sepolia -> ArbSep, BaseSep, Holesky
    // const EthBridgeSepolia = await ethers.getContractAt('EthBridge', contractAddresses.sepolia);
    // await EthBridgeSepolia.connect(deployer).setPeer(arbsepEID, ethers.utils.hexZeroPad(contractAddresses.arbsep, 32));
    // await EthBridgeSepolia.connect(deployer).setPeer(basesepEID, ethers.utils.hexZeroPad(contractAddresses.basesep, 32));
    // await EthBridgeSepolia.connect(deployer).setPeer(holeskyEID, ethers.utils.hexZeroPad(contractAddresses.holesky, 32));
    // console.log("Peers set for Sepolia.");

    // // ArbSep -> Sepolia, BaseSep, Holesky
    // const EthBridgeArbSep = await ethers.getContractAt('EthBridge', contractAddresses.arbsep);
    // await EthBridgeArbSep.connect(deployer).setPeer(sepoliaEID, ethers.utils.hexZeroPad(contractAddresses.sepolia, 32));
    // await EthBridgeArbSep.connect(deployer).setPeer(basesepEID, ethers.utils.hexZeroPad(contractAddresses.basesep, 32));
    // await EthBridgeArbSep.connect(deployer).setPeer(holeskyEID, ethers.utils.hexZeroPad(contractAddresses.holesky, 32));
    // console.log("Peers set for ArbSep.");

    // // BaseSep -> Sepolia, ArbSep, Holesky
    // const EthBridgeBaseSep = await ethers.getContractAt('EthBridge', contractAddresses.basesep);
    // await EthBridgeBaseSep.connect(deployer).setPeer(sepoliaEID, ethers.utils.hexZeroPad(contractAddresses.sepolia, 32));
    // await EthBridgeBaseSep.connect(deployer).setPeer(arbsepEID, ethers.utils.hexZeroPad(contractAddresses.arbsep, 32));
    // await EthBridgeBaseSep.connect(deployer).setPeer(holeskyEID, ethers.utils.hexZeroPad(contractAddresses.holesky, 32));
    // console.log("Peers set for BaseSep.");

    // Holesky -> Sepolia, ArbSep, BaseSep
    const EthBridgeHolesky = await ethers.getContractAt('EthBridge', contractAddresses.holesky);
    await EthBridgeHolesky.connect(deployer).setPeer(sepoliaEID, ethers.utils.hexZeroPad(contractAddresses.sepolia, 32));
    await EthBridgeHolesky.connect(deployer).setPeer(arbsepEID, ethers.utils.hexZeroPad(contractAddresses.arbsep, 32));
    await EthBridgeHolesky.connect(deployer).setPeer(basesepEID, ethers.utils.hexZeroPad(contractAddresses.basesep, 32));
    console.log("Peers set for Holesky.");

    console.log("All peers have been set across chains.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
