// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {HelloMultipleTokens, LiquidityProvided} from "../src/example-extensions/HelloMultipleTokens.sol";

import "wormhole-relayer-solidity-sdk/testing/WormholeRelayerTest.sol";

import "forge-std/Test.sol";
import "forge-std/console.sol";

contract HelloMultipleTokensTest is WormholeRelayerTest {
    event GreetingReceived(string greeting, uint16 senderChain, address sender);

    HelloMultipleTokens public helloSource;
    HelloMultipleTokens public helloTarget;

    ERC20Mock public tokenA;
    ERC20Mock public tokenB;

    function setUpSource() public override {
        helloSource = new HelloMultipleTokens(
            address(relayerSource),
            address(tokenBridgeSource),
            address(wormholeSource)
        );

        tokenA = createAndAttestToken(sourceFork);
        tokenB = createAndAttestToken(sourceFork);
    }

    function setUpTarget() public override {
        helloTarget = new HelloMultipleTokens(
            address(relayerTarget),
            address(tokenBridgeTarget),
            address(wormholeTarget)
        );
    }

    function testRemoteLP() public {
        uint256 amount = 19e17;
        tokenA.approve(address(helloSource), amount);
        tokenB.approve(address(helloSource), amount);

        uint256 cost = helloSource.quoteRemoteLP(targetChain);

        vm.recordLogs();
        helloSource.sendRemoteLP{value: cost}(
            targetChain, address(helloTarget), amount, address(tokenA), address(tokenB)
        );
        performDelivery();

        vm.selectFork(targetFork);
        (uint16 senderChain, address sender, address lpTokenA, address lpTokenB, uint256 lpAmt) =
            helloTarget.lastLiquidityProvided();
        assertEq(senderChain, sourceChain, "senderChain");
        assertEq(sender, address(this), "sender");
        assertEq(lpTokenA, address(tokenA), "tokenA");
        assertEq(lpTokenB, address(tokenB), "tokenB");
        assertEq(lpAmt, amount, "amount");
    }
}