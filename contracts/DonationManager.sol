// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";

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
        uint256[] memory _amounts,
        address _owner
    ) external returns (uint256[] memory requestIds);
}

contract DonationManager is OApp {
    ILido public lidoContract;
    IWithdrawal public withdrawalContract;

    address public lidoReferral;

    mapping(address sender => uint256) public deposits;
    mapping(address sender => uint256[]) public pendingWithdrawalsId;
    mapping(uint256 roundId => Allocation) public allocations;

    struct Allocation {
        uint256 issueId;
        uint256 amount;
    }

    event Deposited(address sender, uint256 stEthAmount);

    constructor(
        address _lidoContract,
        address _withdrawalContract,
        address _endpoint,
        address _delegate
    ) OApp(_endpoint, _delegate) Ownable(_delegate) {
        lidoContract = ILido(_lidoContract);
        withdrawalContract = IWithdrawal(_withdrawalContract);
        lidoReferral = address(this);
    }

    // Deposit function to stake ETH into Lido
    function deposit(address sender) external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");

        // Call Lido's submit function, staking the ETH and passing the referral address
        uint256 stEthAmount = lidoContract.submit{ value: msg.value }(lidoReferral);

        deposits[sender] += msg.value;

        emit Deposited(sender, stEthAmount);
    }

    // Request to withdraw stETH
    function requestWithdrawal(uint256[] calldata amount) external {
        require(deposits[msg.sender] >= amount[0], "Insufficient balance");

        // Approve the amount to be withdrawn from Lido
        uint256[] memory requestIds = withdrawalContract.requestWithdrawals(amount, address(this));

        // Update the sender's deposit amount
        deposits[msg.sender] -= amount[0];

        // Add the pending withdrawal to the mapping
        pendingWithdrawalsId[msg.sender].push(requestIds[0]);
    }

    function setAllocations(uint256[] calldata _issueId, uint256[] calldata _amount) external onlyOwner {
        require(_issueId.length == _amount.length, "Issue and amount arrays must be the same length");

        for (uint256 i = 1; i <= _issueId.length; i++) {
            allocations[_issueId[i]] = Allocation(_issueId[i], _amount[i]);
        }
    }

    /**
     * @dev Internal function override to handle incoming messages from another chain.
     * @dev _origin A struct containing information about the message sender.
     * @dev _guid A unique global packet identifier for the message.
     * @param payload The encoded message payload being received.
     *
     * @dev The following params are unused in the current implementation of the OApp.
     * @dev _executor The address of the Executor responsible for processing the message.
     * @dev _extraData Arbitrary data appended by the Executor to the message.
     *
     * Decodes the received payload, logs the event, and processes the received ETH amount.
     */
    function _lzReceive(
        Origin calldata /*_origin*/,
        bytes32 /*_guid*/,
        bytes calldata payload,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        (address sender, uint256 amount) = abi.decode(payload, (address, uint256));
        require(amount > 0, "Deposit amount must be greater than 0");

        // Call Lido's submit function, staking the ETH and passing the referral address
        uint256 stEthAmount = lidoContract.submit{ value: msg.value }(lidoReferral);

        deposits[sender] += msg.value;

        // Process the bridged ETH here (if needed).
        emit Deposited(sender, stEthAmount);
    }

    /**
     * @notice Withdraw ETH in case of emergency or unused funds.
     * @dev Can only be called by the contract owner.
     */
    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
