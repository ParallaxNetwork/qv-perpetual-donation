import { networkToEndpointId, EndpointVersion } from '@layerzerolabs/lz-definitions'
import assert from 'assert'
import { type DeployFunction } from 'hardhat-deploy/types'

// Declare your contract name here
const contractName = 'StakeBridge'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy } = deployments
    const { deployer, c2deployer } = await getNamedAccounts()

    assert(c2deployer, 'Missing named c2deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${c2deployer}`)

    // This is an external deployment pulled in from @layerzerolabs/lz-evm-sdk-v2
    // Ensure your hardhat config is set up correctly with network and eid properties
    const endpointV2Deployment = await hre.deployments.get('EndpointV2');

    const { address } = await deploy(contractName, {
        from: c2deployer,
        args: [
            endpointV2Deployment.address, // LayerZero's EndpointV2 address
            deployer,                      // Owner of the contract
            '0xb03A1229B8B71cD5C97Abd10BE0238700970a770',
            networkToEndpointId(hre.network.name, EndpointVersion.V2),
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)
}

deploy.tags = [contractName]

export default deploy
