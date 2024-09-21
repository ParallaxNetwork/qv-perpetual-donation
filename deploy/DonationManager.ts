import assert from 'assert'
import { type DeployFunction } from 'hardhat-deploy/types'

// Declare your contract name here
const contractName = 'DonationManager'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    // This is an external deployment pulled in from @layerzerolabs/lz-evm-sdk-v2
    // Ensure your hardhat config is set up correctly with network and eid properties
    const endpointV2Deployment = await hre.deployments.get('EndpointV2')

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            '0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034',
            '0xc7cc160b58F8Bb0baC94b80847E2CF2800565C50',
            endpointV2Deployment.address, // LayerZero's EndpointV2 address
            deployer,                      // Owner of the contract
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)
}

deploy.tags = [contractName]

export default deploy
