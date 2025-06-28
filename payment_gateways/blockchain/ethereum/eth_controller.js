const utils = require('../../../utils');
const config = require('../../../lib/config');
const axios = require('axios');
const {Web3} = require('web3');
const QRCode = require("qrcode");

// Create a new instance of Web3
const web3 = new Web3('https://eth-mainnet.g.alchemy.com/v2/UuPyoMLQCudZW_4m4Z9A-tdmEDsJ3wqt');

const account1 = {
    privateKey: '0x6e09a99bd1a67761c11b2aaad68c26a2f4b39c0eac54709a3e096f0323a8f1aa',
    address: '0xFC3d84183Ee3277B6D926113c3a7eE53e6179E09'
}

const account2 = {
    privateKey: '',
    address: '0xe3bd95fB04192Bba3EA42317C554336F81C799fc'
}


const test_account1 = {
    privateKey: '',
    address: ''
}

const test_account2 = {
    privateKey: '',
    address: ''
}


const usdtContractAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'; // USDT contract address on Ethereum
const usdtABI = [
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            { "name": "_to", "type": "address" },
            { "name": "_value", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "name": "", "type": "bool" }],
        "type": "function"
    }
];

// Instantiate the Chainlink USDT/USD Price Feed
const ChainlinkAggregatorV3InterfaceABI = require('./ChainlinkAggregatorV3Interface.json'); // ABI for Chainlink Price Feed
const chainlinkUSDTUSDAddress = '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D'; // Chainlink's USDT/USD feed on Ethereum mainnet
const chainlinkContract = new web3.eth.Contract(ChainlinkAggregatorV3InterfaceABI, chainlinkUSDTUSDAddress);


const usdt_contract = new web3.eth.Contract(usdtABI, usdtContractAddress);

exports.createAccount = async () => {
    try {
        const account = web3.eth.accounts.create();
        return {
            privateKey: account.privateKey,
            address: account.address,
            success: true,
        }
    } catch (e) {
        return {
            privateKey: null,
            address: null,
            success: false,
            error: e.message
        }
    }
}


exports.checkEthBalance = async (address) => {
    try {
        const balanceWei = await web3.eth.getBalance(address);
        // Convert balance from Wei to Ether
        const balanceEther = web3.utils.fromWei(balanceWei, 'ether');

        const ethPriceResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const ethPriceInUSD = ethPriceResponse.data.ethereum.usd;

        return {
            eth: parseFloat(parseFloat(balanceEther).toFixed(4)),
            usd: parseFloat((balanceEther * ethPriceInUSD).toFixed(2)),
            success: true,
        }
    } catch (e) {
        return {
            success: false,
            error: e.message
        }
    }
};

exports.convertUSDToETH = async (amountInUSD) => {
    try {
        // Fetch the current ETH to USD price from CoinGecko API
        const ethPriceResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const ethPriceInUSD = ethPriceResponse.data.ethereum.usd;

        // Calculate the equivalent amount in ETH
        const amountInETH = amountInUSD / ethPriceInUSD;

        return {
            eth: amountInETH,
            usd: amountInUSD,
            current_price_usd: ethPriceInUSD,
            success: true,
        }
    } catch (e) {
        return {
            success: false,
            error: e.message
        }
    }
};

exports.sendEth = async (data) => {
    try {
        // Get the current nonce for the sender
        const nonce = await web3.eth.getTransactionCount(data.sender_address, 'latest');

        // Build the transaction object
        const tx = {
            from: data.sender_address,
            to: data.receiver_address,
            value: web3.utils.toWei(data.amount, 'ether'), // Convert ETH to Wei
            gas: 21000, // Gas limit for standard ETH transfers
            nonce: nonce,
        };

        // Sign the transaction
        const signedTx = await web3.eth.accounts.signTransaction(tx, data.private_key);

        // Send the signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return{
            success: true,
            ...receipt
        }
    } catch (error) {
        return{
            success: false,
            error: error.message
        }
    }
};

exports.sendEth2 = async (data) => {
    try {
        // Get the current nonce for the sender
        const nonce = await web3.eth.getTransactionCount(data.sender_address, 'latest');

        // Gas limit for standard ETH transfers (21,000 for basic transfers)
        const gasLimit = 21000;

        // Get the current gas price from the network (in Wei)
        const gasPrice = await web3.eth.getGasPrice();

        // Calculate the gas fee in ETH (gasLimit * gasPrice)
        const gasFeeInWei = BigInt(gasLimit) * BigInt(gasPrice);
        const gasFeeInEth = web3.utils.fromWei(gasFeeInWei.toString(), 'ether');

        console.log(`Estimated Gas Fee: ${gasFeeInEth} ETH`);

        // Build the transaction object with dynamic gas price and gas limit
        const tx = {
            from: data.sender_address,
            to: data.receiver_address,
            value: web3.utils.toWei(data.amount, 'ether'), // Convert ETH amount to Wei
            gas: gasLimit, // Gas limit for ETH transfer
            gasPrice: gasPrice, // Dynamically fetched gas price
            nonce: nonce, // Transaction count
        };

        // Sign the transaction
        const signedTx = await web3.eth.accounts.signTransaction(tx, data.private_key);

        // Send the signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        // Return success with transaction receipt
        return {
            success: true,
            gasFeeInEth: gasFeeInEth, // Return the estimated gas fee
            ...receipt
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Function to calculate gas fee before sending the transaction
const calculateEthFee = async (data) => {
    try {
        // Get the nonce for the sender's address
        const nonce = await web3.eth.getTransactionCount(data.sender_address, 'latest');

        // Gas limit for a simple ETH transfer (usually 21,000)
        const gasLimit = 21000;

        // Get the current gas price (in Wei)
        const gasPrice = await web3.eth.getGasPrice();

        // Calculate total gas fee in Wei (gasLimit * gasPrice)
        const gasFeeInWei = BigInt(gasLimit) * BigInt(gasPrice);
        const gasFeeInEth = web3.utils.fromWei(gasFeeInWei.toString(), 'ether');
        console.log(`Estimated Gas Fee: ${gasFeeInEth} ETH`);

        // Optionally convert ETH to USD (fetch current ETH price from CoinGecko)
        const ethPriceResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const ethPriceInUSD = ethPriceResponse.data.ethereum.usd;
        const gasFeeInUSD = gasFeeInEth * ethPriceInUSD;
        console.log(`Estimated Gas Fee in USD: $${gasFeeInUSD.toFixed(2)}`);

        // Create the transaction object
        const tx = {
            from: data.sender_address,
            to: data.receiver_address,
            //value: web3.utils.toWei(ethAmountToSend, 'ether'),
            gas: gasLimit,
            gasPrice: gasPrice,
            nonce: nonce,
        };

        // You can now display or return the calculated fee and the transaction object

        return {
            success: true,
            gasFeeInEth: gasFeeInEth,
            gasFeeInUSD: gasFeeInUSD.toFixed(2),
            txObject: tx
        };
    } catch (error) {
        console.error('Error calculating gas fee:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

exports.checkUsdtBalance = async (address) => {
    try {
        const balance = await usdt_contract.methods.balanceOf(address).call();
        const usdtBalance = Number(balance) / 10 ** 6; // Convert balance to Number for compatibility

        // Fetch the latest price from Chainlink's Price Feed
        const latestRoundData = await chainlinkContract.methods.latestRoundData().call();
        const usdtPriceInUSD = Number(latestRoundData.answer) / 10 ** 8; // Adjust to Number for compatibility
        const balanceInUSD = usdtBalance * usdtPriceInUSD;

        return {
            usdt: usdtBalance,
            usd: parseFloat(balanceInUSD.toFixed(2)),
            success: true,
        }
    } catch (e) {
        //console.log(e)
        return {
            success: false,
            error: e.message
        }
    }
};

exports.convert_USD_To_USDT = async (amountInUSD) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd');
        const rate = response.data.tether.usd;

        // Assuming you want to convert 100 USD to USDT
        const amountInUSDT = amountInUSD * rate;

        return {
            usdt: amountInUSDT,
            usd: amountInUSD,
            rate: rate,
            success: true,
        }
    } catch (e) {
        return {
            success: false,
            error: e.message
        }
    }
};

exports.sendUSDT = async (data) => {
    try {

        // Get the nonce for the sender's address (used to ensure transaction order)
        const nonce = await web3.eth.getTransactionCount(data.sender_address, 'latest');

        // Convert USDT amount to the appropriate units (USDT uses 6 decimals)
        const usdtAmountInWei = BigInt(data.amount * (10 ** 6)).toString();

        // Create the transaction object
        const tx = {
            from: data.sender_address,
            to: usdtContractAddress,
            gas: 100000, // Estimate gas limit (can adjust if needed)
            data: usdt_contract.methods.transfer(data.receiver_address, usdtAmountInWei).encodeABI(),
            nonce: nonce,
        };

        // Sign the transaction with the sender's private key
        const signedTx = await web3.eth.accounts.signTransaction(tx, data.private_key);

        // Send the signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        return{
            success: true,
            ...receipt
        }
    } catch (error) {
        return{
            success: false,
            error: error.message
        }
    }
};

exports.sendUSDT2 = async (data) => {
    try {
        // Get the nonce for the sender's address
        const nonce = await web3.eth.getTransactionCount(data.sender_address, 'latest');

        // Convert USDT amount to the appropriate units (USDT uses 6 decimals)
        const usdtAmountInWei = BigInt(data.amount * (10 ** 6)).toString();

        // Estimate gas limit for the USDT transfer
        const gasLimit = await usdt_contract.methods
            .transfer(data.receiver_address, usdtAmountInWei)
            .estimateGas({ from: data.sender_address });

        // Get the current gas price from the network
        const gasPrice = await web3.eth.getGasPrice();

        // Calculate total gas fee in ETH (gasLimit * gasPrice)
        const gasFeeInWei = BigInt(gasLimit) * BigInt(gasPrice);
        const gasFeeInEth = web3.utils.fromWei(gasFeeInWei.toString(), 'ether');

        console.log(`Estimated Gas Fee: ${gasFeeInEth} ETH`);

        // Optionally, fetch ETH price and calculate fee in USD
        const ethPriceResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const ethPriceInUSD = ethPriceResponse.data.ethereum.usd;
        const gasFeeInUSD = gasFeeInEth * ethPriceInUSD;

        console.log(`Estimated Gas Fee in USD: $${gasFeeInUSD.toFixed(2)}`);

        // Create the transaction object
        const tx = {
            from: data.sender_address,
            to: usdtContractAddress,
            gas: gasLimit, // Use the dynamically estimated gas limit
            gasPrice: gasPrice, // Use the current gas price
            data: usdt_contract.methods.transfer(data.receiver_address, usdtAmountInWei).encodeABI(),
            nonce: nonce,
        };

        // Sign the transaction with the sender's private key
        const signedTx = await web3.eth.accounts.signTransaction(tx, data.private_key);

        // Send the signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        return {
            success: true,
            gasFeeInEth: gasFeeInEth,
            gasFeeInUSD: gasFeeInUSD.toFixed(2),
            ...receipt
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Function to calculate the gas fee
const calculateUSDTGasFee = async (data) => {
    try {
        const usdtAmountInWei = BigInt(data.amount * (10 ** 6)).toString();
        // Estimate the gas limit for the transfer transaction
        const gasLimit = await usdt_contract.methods.transfer(data.receiver_address, usdtAmountInWei).estimateGas({ from: data.sender_address });


        // Get the current gas price from the network
        const gasPrice = await web3.eth.getGasPrice();


        // Calculate the transaction fee in Wei
        const feeInWei = gasLimit * gasPrice;

        // Convert the fee to Ether
        const feeInEth = web3.utils.fromWei(feeInWei.toString(), 'ether');
        console.log(`Estimated Gas Fee: ${feeInEth} ETH`);

        // Optionally, convert the fee in ETH to USD
        const ethPriceResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const ethPriceInUSD = ethPriceResponse.data.ethereum.usd;
        const feeInUSD = feeInEth * ethPriceInUSD;
        console.log(`Estimated Gas Fee: $${feeInUSD.toFixed(2)} USD`);
    } catch (error) {
        console.error('Error calculating gas fee:', error);
    }
}


exports.initialize_ETH_Payment = async (data) => {
    try{
        const priceData = await this.convertUSDToETH(data.amount)
        const account = await this.createAccount();

        // Convert Ether to Wei
        const valueInWei = web3.utils.toWei(priceData.eth.toString(), 'ether');
        const recipientAddress = account.address; // replace with your recipient address

        const value = priceData.eth.toFixed(4);

        // Construct the Ethereum URI
        const ethURI = `ethereum:${recipientAddress}?value=${value}`;

        const qr_code = await QRCode.toDataURL(ethURI);

        return {
            uri: ethURI,
            private_key: account.privateKey,
            address: account.address,
            qr_code: qr_code,
            crypto_amount: value,
            success: true,
        }

    } catch (e) {
        return{
            success: false,
        }
    }
}

exports.initialize_USDT_ERC20_Payment = async (data) => {
    try{
        const priceData = await this.convert_USD_To_USDT(data.amount)
        const account = await this.createAccount();

        const value = priceData.usdt?.toFixed(6);

        const recipientAddress = account.address; // Replace with recipient's address

        // Construct the Ethereum URI for USDT (ERC-20)
        const usdtURI = `ethereum:${recipientAddress}?value=${value}&token=${usdtContractAddress}`;

        const qr_code = await QRCode.toDataURL(usdtURI);

        return {
            uri: usdtURI,
            private_key: account.privateKey,
            address: account.address,
            qr_code: qr_code,
            crypto_amount: value,
            success: true,
        }

    } catch (e) {
        return{
            success: false,
        }
    }
}


exports.test = async (req, res) => {
    try {
        let result

        const data = {
            sender_address: account1.address,
            private_key: account1.privateKey,
            receiver_address: account2.address,
            amount: 5
        }

        //result = await this.createAccount()

        //ETH
        //result = await this.checkEthBalance(account1.address)
        //result = await this.sendEth(data)
        //result = await this.convertUSDToETH(100)
        //result = calculateEthFee(data)

        //USDT
        result = await this.checkUsdtBalance("0xC37a8E153544Aa83e1f507D2BB444084D2350636")
        //result = await this.convert_USD_To_USDT(10)
        //result = await this.sendUSDT(data)

        //result = await calculateUSDTGasFee(data)
        /*result = await this.initialize_ETH_Payment({
            amount: 100,
            message: 'ETH Payment',
        })*/

        /*result = await this.initialize_USDT_ERC20_Payment({
            amount: 100,
            message: 'USDT ERC20 Payment',
        })*/

        res.send({
            result: result,
            // contract, tx,
            //transaction: transaction,
            success: true
        });


    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            errors: error,
            response: 'An error occurred',
            message: 'There was an error'
        });
    }
};