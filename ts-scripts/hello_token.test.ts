import { describe, expect, test } from "@jest/globals";
import { ethers } from "ethers";
import {
  getHelloToken,
  loadDeployedAddresses as getDeployedAddresses,
  getWallet,
  getChain,
  wait,
  loadConfig,
} from "./utils";
import { waitForDelivery } from "./getStatus";
import { ERC20Mock__factory, ITokenBridge__factory } from "./ethers-contracts";
import {
  tryNativeToUint8Array,
  CHAIN_ID_TO_NAME,
  CHAINS,
} from "@certusone/wormhole-sdk";

const sourceChain = loadConfig().sourceChain;
const targetChain = loadConfig().targetChain;

describe("Hello Tokens Integration Tests on Testnet", () => {
  // test(
  //   "Tests the sending of a token",
  //   async () => {
  //     // Token Bridge can only deal with 8 decimal places
  //     // So we send a multiple of 10^10, since this MockToken has 18 decimal places
  //     const arbitraryTokenAmount = ethers.BigNumber.from(
  //       new Date().getTime() % 10 ** 7
  //     ).mul(10 ** 10);

  //     const HTtoken = ERC20Mock__factory.connect(
  //       getDeployedAddresses().erc20s[sourceChain][0],
  //       getWallet(sourceChain)
  //     );

  //     const wormholeWrappedHTTokenAddressOnTargetChain =
  //       await ITokenBridge__factory.connect(
  //         getChain(targetChain).tokenBridge,
  //         getWallet(targetChain)
  //       ).wrappedAsset(
  //         sourceChain,
  //         tryNativeToUint8Array(HTtoken.address, "ethereum")
  //       );
  //     const wormholeWrappedHTTokenOnTargetChain = ERC20Mock__factory.connect(
  //       wormholeWrappedHTTokenAddressOnTargetChain,
  //       getWallet(targetChain)
  //     );

  //     const walletTargetChainAddress = getWallet(targetChain).address;

  //     const sourceHelloTokenContract = getHelloToken(sourceChain);
  //     const targetHelloTokenContract = getHelloToken(targetChain);

  //     const walletOriginalBalanceOfWrappedHTToken =
  //       await wormholeWrappedHTTokenOnTargetChain.balanceOf(
  //         walletTargetChainAddress
  //       );

  //     const cost = await sourceHelloTokenContract.quoteCrossChainDeposit(
  //       targetChain
  //     );
  //     console.log(
  //       `Cost of sending the tokens: ${ethers.utils.formatEther(
  //         cost
  //       )} testnet ${CHAIN_ID_TO_NAME[sourceChain]}`
  //     );

  //     // Approve the HelloToken contract to use 'arbitraryTokenAmount' of our HT token
  //     const approveTx = await HTtoken.approve(
  //       sourceHelloTokenContract.address,
  //       arbitraryTokenAmount
  //     ).then(wait);
  //     console.log(
  //       `HelloToken contract approved to spend ${ethers.utils.formatEther(
  //         arbitraryTokenAmount
  //       )} of our HT token`
  //     );

  //     console.log(
  //       `Sending ${ethers.utils.formatEther(
  //         arbitraryTokenAmount
  //       )} of the HT token`
  //     );

  //     const tx = await sourceHelloTokenContract.sendCrossChainDeposit(
  //       targetChain,
  //       targetHelloTokenContract.address,
  //       walletTargetChainAddress,
  //       arbitraryTokenAmount,
  //       HTtoken.address,
  //       { value: cost }
  //     );

  //     console.log(`Transaction hash: ${tx.hash}`);
  //     await tx.wait();

  //     await waitForDelivery(CHAIN_ID_TO_NAME[sourceChain], tx.hash);

  //     console.log(`Seeing if token was sent`);
  //     const walletCurrentBalanceOfWrappedHTToken =
  //       await wormholeWrappedHTTokenOnTargetChain.balanceOf(
  //         walletTargetChainAddress
  //       );

  //     expect(
  //       walletCurrentBalanceOfWrappedHTToken
  //         .sub(walletOriginalBalanceOfWrappedHTToken)
  //         .toString()
  //     ).toBe(arbitraryTokenAmount.toString());
  //   },
  //   60 * 1000 * 60
  // ); // timeout

  test(
    "Sending native token",
    async () => {
      const arbitraryTokenAmount = ethers.utils.parseEther("0.01");
      const sourceHelloTokenContract = getHelloToken(sourceChain);
      const targetHelloTokenContract = getHelloToken(targetChain);

      // const walletTargetChainAddress = getWallet(targetChain).address;
      const walletTargetChainAddress =
        "0x3039e4a4a540F35ae03A09f3D5A122c49566f919";

      const cost = await sourceHelloTokenContract.quoteCrossChainDeposit(
        targetChain
      );

      console.log(
        `Cost of sending the tokens: ${ethers.utils.formatEther(
          cost
        )} testnet ${CHAIN_ID_TO_NAME[sourceChain]}`
      );

      const value = cost.add(arbitraryTokenAmount);

      const tx = await sourceHelloTokenContract.sendNativeCrossChainDeposit(
        targetChain,
        targetHelloTokenContract.address,
        walletTargetChainAddress,
        arbitraryTokenAmount,
        { value, gasLimit: 2_000_000 }
      );

      console.log(`Transaction hash: ${tx.hash}`);

      await tx.wait();

      await waitForDelivery(CHAIN_ID_TO_NAME[sourceChain], tx.hash);

      console.log(`Seeing if token was sent`);
    },
    60 * 1000 * 60
  );
});
