// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ILido {
    /**
     * @notice Send funds to the pool with optional _referral parameter
     * @dev This function is alternative way to submit funds. Supports optional referral address.
     * @return Amount of StETH shares generated
     */
    function submit(address _referral) external payable returns (uint256);
}

interface IWithdrawal {
    /// @notice Request the batch of stETH for withdrawal. Approvals for the passed amounts should be done before.
    /// @param _amounts an array of stETH amount values.
    ///  The standalone withdrawal request will be created for each item in the passed list.
    /// @param _owner address that will be able to manage the created requests.
    ///  If `address(0)` is passed, `msg.sender` will be used as owner.
    /// @return requestIds an array of the created withdrawal request ids
    function requestWithdrawals(
        uint256[] _amounts,
        address _owner
    ) returns (uint256[] requestIds);
}

contract DonationManager {
    ILido public lidoContract;
    IWithdrawal public withdrawalContract;

    address public lidoReferral;

    mapping(address => uint256) public deposits;
    mapping(address => uint256[]) public pendingWithdrawalsId;

    constructor(address _lidoContract, address _withdrawalContract) {
        lidoContract = ILido(_lidoContract);
        withdrawalContract = IWithdrawal(_withdrawalContract);
        lidoReferral = address(this);
    }

    // Deposit function to stake ETH into Lido
    function deposit(address sender) external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");

        // Call Lido's submit function, staking the ETH and passing the referral address
        uint256 stEthAmount = lidoContract.submit{value: msg.value}(
            lidoReferral
        );

        deposits[sender] += msg.value;
    }

    // Request to withdraw stETH
    function requestWithdrawal(uint256 amount) external {
        require(deposits[msg.sender] >= amount, "Insufficient balance");

        uint256[] amounts = [amount];
        // Approve the amount to be withdrawn from Lido
        uint256[] requestIds = withdrawalContract.requestWithdrawals(
            amounts,
            address(this)
        );

        // Update the sender's deposit amount
        deposits[msg.sender] -= amount;

        // Add the pending withdrawal to the mapping
        pendingWithdrawalsId[msg.sender].push(requestIds[0]);
    }
}
