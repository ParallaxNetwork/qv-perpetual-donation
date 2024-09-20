// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";

contract EthBridge is OApp {
    constructor(address _endpoint, address _delegate) OApp(_endpoint, _delegate) Ownable(_delegate) {}

    event BridgeInitiated(uint32 _dstEid, uint256 amount, address sender);
    event ReceivedOnDestination(address sender, uint256 amount);

    string public data = "Nothing received yet.";

    /**
     * @notice Sends ETH from the source chain to a destination chain.
     * @param _dstEid The endpoint ID of the destination chain.
     * @param _amount The amount of ETH to send.
     * @param _options Additional options for message execution.
     * @dev Sends the ETH using the `_lzSend` internal function with the `lzNativeDrop` for native gas token bridging.
     * @return receipt A `MessagingReceipt` struct containing details of the message sent.
     */
    function bridgeETH(
        uint32 _dstEid,
        uint256 _amount,
        bytes calldata _options
    ) external payable returns (MessagingReceipt memory receipt) {
        require(msg.value >= _amount, "Insufficient ETH for bridging.");

        bytes memory payload = abi.encode(msg.sender, _amount);
        receipt = _lzSend(_dstEid, payload, _options, MessagingFee(msg.value, 0), payable(msg.sender));

        emit BridgeInitiated(_dstEid, _amount, msg.sender);
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

    // Fallback function to accept ETH
    receive() external payable {}
}
