import  ethers  from  'ethers';
import Web3 from 'web3';
import { privateKeyToSafeSmartAccount } from 'permissionless/accounts';
import { Address, Hash, createPublicClient, http } from 'viem';
import { bundlerActions, createSmartAccountClient } from 'permissionless';
import { pimlicoBundlerActions } from 'permissionless/actions/pimlico';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { sepolia } from 'viem/chains';
import { abi } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json';

const UNISWAP_ROUTER_ADDRESS = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E	';
const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'; // Wrapped ETH address
const PEPE_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // DAI token address

const INFURA_API_KEY = process.env.INFURA_API_KEY!;
const eprivateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY!;
const privateKey = '0x' + eprivateKey;
const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;

const paymasterUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`
const bundlerUrl = `https://api.pimlico.io/v1/sepolia/rpc?apikey=${apiKey}`
const nodeUrl = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`

const publicClient = createPublicClient({
	transport: http("https://rpc.ankr.com/eth_sepolia"),
})
 
const paymasterClient = createPimlicoPaymasterClient({
	transport: http(paymasterUrl),
})

const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

async function createUniswapTransaction(web3: Web3, address: Address, amountInETH: number, amountOutMin: number) {;
    const uniswapRouter = new web3.eth.Contract(abi, UNISWAP_ROUTER_ADDRESS);
    const amountIn = ethers.parseEther(amountInETH.toString());
    const path = [ETH_ADDRESS, PEPE_ADDRESS];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; 

    const data = await uniswapRouter.methods.swapExactETHForTokens(
        amountOutMin,
        path,
        address,
        deadline,
        { value: amountIn }
    );

    return data;
}

async function sendTx(amountInETH: number, amountOutMin: number){
    const fid = process.env.NEXT_PUBLIC_MYFID;
    if (!fid) {
        return null;
    }
    const account = await privateKeyToSafeSmartAccount(publicClient, {
        privateKey: privateKey as Hash,
        safeVersion: "1.4.1", // simple version
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // global entrypoint
        saltNonce: BigInt(fid)
    })

    const data_raw = await createUniswapTransaction(web3, account.address, amountInETH, amountOutMin);
    const data = data_raw.encodeABI();

    const callData = await account.encodeCallData({ 
        to: UNISWAP_ROUTER_ADDRESS, 
        data: `0x${data}`,
        value: BigInt(amountInETH) 
    });

    const smartAccountClient = createSmartAccountClient({
        account,
        chain: sepolia,
        transport: http(bundlerUrl),
        sponsorUserOperation: paymasterClient.sponsorUserOperation,
    })
        .extend(bundlerActions)
        .extend(pimlicoBundlerActions)

    const userOperation = await smartAccountClient.prepareUserOperationRequest({
        userOperation: {
            callData
        },
    })

    userOperation.signature = await account.signUserOperation(userOperation)

    const userOpHash = await smartAccountClient.sendUserOperation({
        userOperation,
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
    })

    return userOpHash;
}

sendTx(0.1, 0.00001);




