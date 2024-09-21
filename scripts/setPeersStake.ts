const { ethers } = require('hardhat');

async function main() {
    const sepoliaEID = 40161;
    const arbsepEID = 40231;
    const basesepEID = 40245;
    const holeskyEID = 40217;

    const contractAddress = '0xf1Bc974ee80e0B9b2b7F124E4Dc44780CD216f99';

    const [deployer, c2deployer] = await ethers.getSigners();
    
    console.log("Setting peers with the account:", deployer.address);

    
    // Set peers for all chains
    console.log("Setting peers...");

    const Bridge = await ethers.getContractAt('StakeBridge', contractAddress);
    await Bridge.connect(deployer).setPeer(holeskyEID, ethers.utils.hexZeroPad('0xb03A1229B8B71cD5C97Abd10BE0238700970a770', 32));

    // const DM = await ethers.getContractAt('DonationManager', '0xb03A1229B8B71cD5C97Abd10BE0238700970a770');

    // await DM.connect(deployer).setPeer(sepoliaEID, ethers.utils.hexZeroPad(contractAddress, 32));
    // await DM.connect(deployer).setPeer(arbsepEID, ethers.utils.hexZeroPad(contractAddress, 32));
    // await DM.connect(deployer).setPeer(basesepEID, ethers.utils.hexZeroPad(contractAddress, 32));
   
    console.log("Peers set.");

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
