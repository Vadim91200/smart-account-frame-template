import  ethers  from  'ethers';
import Web3 from 'web3';

const UNISWAP_ROUTER_ADDRESS = '0x198EF79F1F515F02dFE9e3115eD9fC07183f02fC ';
const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'; // Wrapped ETH address
const PEPE_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI token address
const INFURA_API_KEY = '';

const { abi } = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json');

const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${INFURA_API_KEY}`));

async function createUniswapTransaction(web3: Web3, address: String, amountInETH: Number, amountOutMin: Number) {;
    const uniswapRouter = new web3.eth.Contract(abi, UNISWAP_ROUTER_ADDRESS);
    const amountIn = ethers.utils.parseEther(amountInETH.toString());
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

async function createTx(web3, account, method_data){
    var data = method_data.encodeABI();

    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await method_data.estimateGas({ from: account.address });

    const transaction = {
        to: MarketplaceAddress,
        data: data,
        gasPrice: gasPrice,
        gas: gasEstimate,
    };

    return transaction;
}

async function swapMemeCoinForETH(web3, account, amountInETH, amountOutMin) {
    const tx_data = await createUniswapTransaction(web3, amountInETH, account, amountOutMin);
    const tx = await createTx(web3, account, tx_data);
    return tx;
}

module.exports = { swapMemeCoinForETH };

