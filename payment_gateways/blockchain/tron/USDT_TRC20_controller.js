const utils = require('../../../utils');
const config = require('../../../lib/config');
const {TronWeb} = require('tronweb');
const ethers = require('ethers')
const axios = require('axios');
const QRCode = require('qrcode');


const privateKey = "73833718261B9695F5C764DF8691C317385A2BEA30958988083F64118B199D12";
const publicKey = "04F61B65F14FF7A0AD41FB0AF273E9F81898B2212FE4DFC7B75872F6FA0B964EBA1236533281D2F0AACF0B6447421941C197127F307A5AF7F853ECC1148F8313D6";
const publicAddress = "TPWQpTxrLhW1U151xhrH6HK6UC4wvpjQMm" // base58
const publicHex = "4194806506F2BB621460FB4A32D86CA279161C7E55"

const privateKey2 = "13155F116EB02F65D12A74F6C01A8782B98698E48DB6BEAEFC7A1B73A946A7BA";
const publicKey2 = "045819BC2C52CB8CD00BC0B69275FD5B194C1787FE2C443A8EE3DFE95109DDAC8E9D89CD81E20862C39A69EDC35DBE35630360EAEBF6D9BF9BB4B2848129BAE72A";
const publicAddress2 = "TMNWPrR12Wn2PfKUpqoFvyZ8dpkvUwyJmf" // base58
const publicHex2 = "417D11783D42B587C0F16CFD41FB87F36861B98B74"


const privateKey_test = "74937FC8E2BDECA0C076F7DD9E9FE302F3A655248AB04F16271AD727B42ADEEE";
const publicKey_test = "0441DAE4886968845D3C77941CD006F8C9444E752EC46E47E49D0081CCA8F3784247E5C3C4B087868D1069B532D2797DD6953911F84F37344C05FAD96032230B53";
const publicAddress_test = "TVCvnGoXz2nD2xN2va6uSuZetyWEVD7rM1" // base58
const publicHex_test = "41D302AC57A5857339EC6A907823419FFD40A5997A"

const account1 = {
    privateKey: '74937FC8E2BDECA0C076F7DD9E9FE302F3A655248AB04F16271AD727B42ADEEE',
    publicKey: '0441DAE4886968845D3C77941CD006F8C9444E752EC46E47E49D0081CCA8F3784247E5C3C4B087868D1069B532D2797DD6953911F84F37344C05FAD96032230B53',
    address: 'TVCvnGoXz2nD2xN2va6uSuZetyWEVD7rM1'
}

const account2 = {
    privateKey: '169F7294918A43881C9EDEDE3F4EE50C8DC84F277C21F925ED00384F3234A3ED',
    publicKey: '169F7294918A43881C9EDEDE3F4EE50C8DC84F277C21F925ED00384F3234A3ED',
    address: 'TKgKJw7WELNH56g5ir178zvtUapiQUqpXB'
}

const account3 = {
    privateKey: '92BF68B8123F4ED748A4EB472F27BAFC6D40B47F4801F4D190AC62094371BFED',
    publicKey: '92BF68B8123F4ED748A4EB472F27BAFC6D40B47F4801F4D190AC62094371BFED',
    address: 'TYAP78JSx5zSpH7PbSZY4Zfh39Cv36XgPv'
}

const contractAddressShastaTestnet = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const contractAddressNileTestnet = "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf";
const contractAddressMainnet = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

const fullHostShastaTestnet = "https://api.shasta.trongrid.io";
const fullHostMain = "https://api.trongrid.io";

const fullHost = fullHostMain;
const contractAddress = contractAddressMainnet;

const AbiCoder = ethers.utils.AbiCoder;
const ADDRESS_PREFIX_REGEX = /^(41)/;
const ADDRESS_PREFIX = "41";

const tronWeb = new TronWeb({
    fullHost: fullHost,
    //privateKey: privateKey,
    //solidityNode: 'https://api.trongrid.io',
    //eventServer: 'https://api.trongrid.io',
    //headers: {'TRON-PRO-API-KEY': '437678f8-211c-485c-986c-648dddce7e73'},
    privateKey: account1.privateKey
});

async function encodeParams(inputs) {
    let typesValues = inputs
    let parameters = ''

    if (typesValues.length == 0)
        return parameters
    const abiCoder = new AbiCoder();
    let types = [];
    const values = [];

    for (let i = 0; i < typesValues.length; i++) {
        let {type, value} = typesValues[i];
        if (type == 'address')
            value = value.replace(ADDRESS_PREFIX_REGEX, '0x');
        else if (type == 'address[]')
            value = value.map(v => toHex(v).replace(ADDRESS_PREFIX_REGEX, '0x'));
        types.push(type);
        values.push(value);
    }

    //console.log(types, values)
    try {
        parameters = abiCoder.encode(types, values).replace(/^(0x)/, '');
    } catch (ex) {
        console.log(ex);
    }
    return parameters
}


exports.createAccount = async () => {
    try {
        const account = await tronWeb.createAccount();
        //console.log(account);
        return {
            privateKey: account.privateKey,
            publicKey: account.privateKey,
            address: account.address.base58,
            success: true,
        }
    } catch (e) {
        return {
            privateKey: null,
            publicKey: null,
            address: null,
            success: false,
        }
    }
}

exports.checkTrixBalance = async (address) => {
    try {
        const balance = await tronWeb.trx.getBalance(address);
        return {
            success: true,
            balance: tronWeb.fromSun(balance)
        }
    } catch (error) {
        return {
            success: false,
            balance: null,
            error: error.message
        }
    }
}

exports.checkUSDTBalance = async (address, privateKey) => {
    try {

        // Get the contract instance
        const tronWeb = new TronWeb({
            fullHost: fullHost,
            privateKey: privateKey,
        });

        const contract = await tronWeb.contract().at(contractAddress);

        /// Call balanceOf function on the contract to get the USDT balance of the wallet
        const balance = await contract.methods.balanceOf(address).call();

        return {
            success: true,
            balance: tronWeb.toDecimal(balance) / 1e6
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            balance: null,
            error: error.message
        }
    }
}

exports.getEnergy = async (data) => {
    try {
        const transaction = await tronWeb.transactionBuilder.triggerConstantContract(
            data.contract_address,
            'transfer(address,uint256)',  // Function to be called (transfer)
            {},  // Options (if any)
            [
                {type: 'address', value: data.receiver_address},  // Recipient
                {type: 'uint256', value: data.amount}  // Amount (in smallest units)
            ],
            data.sender_address  // Sender address
        );

        if (transaction.result && transaction.result.result) {
            return {
                success: true,
                energy_used: transaction.energy_used,
                energy_penalty: transaction.energy_penalty,
                estimated_trx_fee: tronWeb.fromSun(transaction.energy_used * 420),
            }
        }


        //The conversion rate is typically 1 Energy = 420 SUN, where 1 TRX = 1,000,000 SUN.

        return {
            success: false,
        }
    } catch (e) {
        return {
            error: e.message,
            success: false,
        }
    }
}

exports.sendUSDT = async (data) => {
    try {

        const tronWeb = new TronWeb({
            fullHost: fullHost,
            privateKey: data.sender_private_key
        });

        const usdtContract = contractAddress; // Tether TRC-20 contract address
        const recipientAddress = data.receiver_address; // replace with the recipient address
        const senderAddress = tronWeb.address.toHex(data.sender_address); // replace with your address
        const amountInUSDT = data.amount; // amount of USDT to send

        const options = {
            feeLimit: 10000000,
            callValue: 0
        }

        // Create transaction object for TRC-20 transfer
        const transfer = await tronWeb.transactionBuilder.triggerSmartContract(
            usdtContract,
            'transfer(address,uint256)',
            {},
            [
                {type: 'address', value: data.receiver_address},
                {type: 'uint256', value: tronWeb.toSun(amountInUSDT)} // converting USDT to Sun
            ],
            data.sender_address
        );

        // Sign and send the transaction
        const signedTx = await tronWeb.trx.sign(transfer.transaction);
        const receipt = await tronWeb.trx.sendRawTransaction(signedTx);
        //console.log(receipt);

        return {
            success: true,
            ...receipt,
        }
    } catch (e) {
        return {
            error: e.message,
            success: false,
        }
    }
}

exports.sendTRX = async (data) => {
    try {
        const amount = data.amount * 1e6
        const result = await tronWeb.trx.sendTransaction(data.address, amount)
        return {
            success: true,
            ...result,
        }
    } catch (e) {
        return {
            error: e.message,
            success: false,
        }
    }
}

const convert_USDT_to_TRX = async (data) => {
    try {
        // JustSwap Router contract
        const justSwapRouter = 'Your-JustSwap-Router-Contract-Address'; // replace with actual contract address


        const amountInUSDT = 0.5; // amount of USDT to swap

        // Interact with the swap contract
        const tradeobj = await tronWeb.transactionBuilder.triggerSmartContract(
            justSwapRouter,
            'swapExactTokensForTRX(uint256,uint256,address[],address,uint256)',
            {},
            [
                {type: 'uint256', value: tronWeb.toSun(amountInUSDT)},  // USDT amount to swap
                {type: 'uint256', value: 0},  // minimum TRX to receive (slippage control)
                {type: 'address[]', value: [usdtContract, 'TRX']}, // path for swap (USDT -> TRX)
                {type: 'address', value: yourAddress},  // recipient of TRX
                {type: 'uint256', value: Math.floor(Date.now() / 1000) + 60 * 20}  // deadline timestamp
            ],
            yourAddress
        );

        // Sign and broadcast the transaction
        const signedTx = await tronWeb.trx.sign(tradeobj.transaction);
        const receipt = await tronWeb.trx.sendRawTransaction(signedTx);
        console.log(receipt);
    } catch (e) {

    }
}

exports.checkForPayments = async () => {
    try {
        const accountInfo = await tronWeb.trx.getTransactionsRelated(account2.address, 'to');
        const latestTransaction = accountInfo[0];  // Assuming the latest transaction is what you're checking

        //latestTransaction && latestTransaction.to === addressToMonitor
        if (latestTransaction && latestTransaction.to === account2.address) {
            console.log(latestTransaction.amount)
        }

    } catch (error) {
        console.error(error);
    }
};

exports.convertUSDtoUSDT = async (amount) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd');
        const usdtPrice = response.data.tether.usd;
        return {
            price: amount/usdtPrice,
            success: true,
        }
    } catch (err) {
        return {
            success: false,
        }
    }
};

exports.initialize_USDT_TRC20_Payment = async (data) => {
    try{
        const priceData = await this.convertUSDtoUSDT(data.amount)

        const account = await this.createAccount();

        const recipientAddress = account.address; // replace with your recipient address
        const amount = priceData.price.toFixed(2); // amount in USDT
        const tokenAddress = contractAddress; // USDT-TRC20 contract address
        const label = 'Payment';
        const message = 'USDT Payment';

        // Construct the TRON URI
        const usdtURI = `tron:${recipientAddress}?amount=${amount}&token=${tokenAddress}&label=${encodeURIComponent(label)}&message=${encodeURIComponent(message)}`;

        const qr_code = await QRCode.toDataURL(usdtURI);

        return {
            uri: usdtURI,
            private_key: account.privateKey,
            address: account.address,
            qr_code: qr_code,
            crypto_amount: amount,
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
            sender_private_key: account1.privateKey,
            receiver_address: req.body.address,
            contract_address: contractAddressShastaTestnet,
            amount: 5
        }

        let inputs = [
            {type: 'address', value: tronWeb.address.toHex(publicAddress2)},
            {type: 'uint256', value: 10}
        ]

        //let parameters = await encodeParams(inputs)
        // result = await this.getEnergy(data)

        //result = await this.sendUSDT(data)

        result = await this.checkUSDTBalance("TWJUN6YKPRhX5mGW66HartDcqXxtBBvFid", "AE8C19DF91CBEEB55E91D3F31E1B0FB67E2E5CA1F89382D127514826640371FA")

        //result = await tronWeb.trx.sendTransaction(account2.address, data.amount)

        // Sign and broadcast the transaction
        //const signedTx = await tronWeb.trx.sign(tradeObj.transaction);
        //result = await tronWeb.trx.sendRawTransaction(signedTx);

       // console.log(receipt);  // View the transaction receipt


        //await this.checkForPayments();

       /* result = await this.initialize_USDT_TRC20_Payment({
            amount: 100,
            message: 'USDT TRC20 Payment',
        })*/

        //result = await this.convertUSDtoUSDT(50)

        res.send({
            data: data,
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



