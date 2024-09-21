// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OptionsBuilder } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/libs/OptionsBuilder.sol";
import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";

interface IDonationManager {
    function deposit(address sender) external payable;
}

contract StakeBridge is OApp {
    using OptionsBuilder for bytes;

    address public donationManager;
    uint32 public immutable srcEid;

    constructor(
        address _endpoint,
        address _delegate,
        address _donationManager,
        uint32 _srcEid
    ) OApp(_endpoint, _delegate) Ownable(_delegate) {
        donationManager = _donationManager;
        srcEid = _srcEid;
    }

    event DepositInitiated(uint32 _dstEid, uint256 amount, address sender);
    event ReceivedOnDestination(address sender, uint256 amount);

    receive() external payable {
        uint32 _dstEid = 40217; // holesky endpoint id
        uint256 fixAmt;
        if (srcEid == _dstEid) {
            IDonationManager(donationManager).deposit{ value: msg.value }(msg.sender);
            fixAmt = msg.value;
        } else {
            bytes memory _options = OptionsBuilder
                .newOptions()
                .addExecutorLzReceiveOption(50000, 0)
                .addExecutorNativeDropOption(0, bytes32(uint256(uint160(donationManager))));

            uint256 fee = (quoteBridgeFee(_dstEid, 0, _options, false)).nativeFee;
            fixAmt = msg.value - fee - 1000000000000000;

            // the amount paid will not be fully staked, but the fee take a bit of the amount
            _options = OptionsBuilder.newOptions().addExecutorLzReceiveOption(500000, 0).addExecutorNativeDropOption(
                uint128(fixAmt),
                bytes32(uint256(uint160(donationManager)))
            );

            bytes memory payload = abi.encode(msg.sender, fixAmt);
            _lzSend(_dstEid, payload, _options, MessagingFee(msg.value, 0), payable(msg.sender));
        }

        emit DepositInitiated(_dstEid, fixAmt, msg.sender);
    }

    /**
     * @notice Quotes the gas needed to bridge ETH using the omnichain functionality.
     * @param _dstEid Destination chain's endpoint ID.
     * @param _amount The amount of ETH.
     * @param _options Message execution options (e.g., for sending gas to destination).
     * @param _payInLzToken Whether to return fee in ZRO token.
     * @return fee A `MessagingFee` struct containing the calculated gas fee in either the native token or ZRO token.
     */
    function quoteBridgeFee(
        uint32 _dstEid,
        uint256 _amount,
        bytes memory _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        bytes memory payload = abi.encode(msg.sender, _amount);
        fee = _quote(_dstEid, payload, _options, _payInLzToken);
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

        // Process the bridged ETH here (if needed).
        emit ReceivedOnDestination(sender, amount);
    }

    /**
     * @notice Withdraw ETH in case of emergency or unused funds.
     * @dev Can only be called by the contract owner.
     */
    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
