const utils = require('../../../utils');
const config = require('../../../lib/config');
const bitcore = require('bitcore-lib');
const axios = require('axios');
const QRCode = require('qrcode');

const account1 = {
    privateKey: '662d31e53450c66c38a58e89cea0820cb4e3f6621a0c46f13dbff811c32085ce',
    address: '1AXH3fmy7ysvVsgKcej2xiRD8SzCkGJCDd'
}

const account2 = {
    privateKey: '',
    address: 'bc1qgrav595jeeenes0dzx6f5336cst8qrlly97vm7'
}

const account3 = {
    privateKey: '',
    address: '1JbPY7d3EDiaETuxc5knVsCShEtm859pPC'
}


const test_account1 = {
    privateKey: '',
    address: ''
}

const test_account2 = {
    privateKey: '',
    address: ''
}


exports.createAccount = async () => {
    try {
        const privateKey = new bitcore.PrivateKey();
        const address = privateKey.toAddress();
        return {
            privateKey: privateKey.toString(),
            address: address.toString(),
            success: true,
        }
    } catch (e) {
        return {
            privateKey: null,
            publicKey: null,
            address: null,
            success: false,
            error: e.message
        }
    }
}


exports.checkBalance = async (address) => {
    try {
        const url = `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`;
        const response = await axios.get(url);
        const data = response.data;

        const btcPrice = await this.getBitcoinPrice();
        const usd_balance = (data.final_balance * btcPrice.price) / 100000000;

        return {
            balance: data.final_balance,
            btc: bitcore.Unit.fromSatoshis(data.final_balance).toBTC(),
            usd_balance: parseFloat(usd_balance.toFixed(2)),
            total_received: data.total_received,
            total_sent: data.total_sent,
            success: true,
        }
    } catch (e) {
        return {
            success: false,
            error: e.message
        }
    }
};

exports.getBitcoinPrice = async () => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const value = response.data.bitcoin.usd;

        return {
            price: value,
            success: true,
        }
    } catch (e) {
        return {
            success: false,
            error: e.message
        }
    }
};

exports.convertBTCtoUSD = async (btcAmount) => {
    try {
        const btcPrice = await this.getBitcoinPrice();
        const value = btcAmount * btcPrice.price;
        return {
            price: value.toFixed(2),
            success: true,
        }
    } catch (e) {
        return {
            success: false,
            error: e.message
        }
    }
};

exports.convertUSDtoBTC = async (usdAmount) => {
    try {
        const btcPrice = await this.getBitcoinPrice();
        const value = usdAmount / btcPrice.price;
        return {
            price: value.toFixed(8),
            success: true,
        }
    } catch (e) {
        return {
            success: false,
            error: e.message
        }
    }
};

exports.convertSatoshisToUSD = async (satoshis) => {
    try {
        const btcPrice = await this.getBitcoinPrice();
        const value = (satoshis * btcPrice.price) / 100000000;
        return {
            price: value.toFixed(2),
            success: true,
        }
    } catch (e) {
        return {
            success: false,
            error: e.message
        }
    }
};

exports.convertUSDToSatoshis = async (usdAmount) => {
    try {
        const btcPrice = await this.getBitcoinPrice();
        const value = (usdAmount / btcPrice.price) * 100000000;
        return {
            price: parseInt(value.toFixed(0)),
            success: true,
        }
    } catch (e) {
        return {
            success: false,
            error: e.message
        }
    }
};


// Fetch UTXOs for the sender's address
exports.getUTXOs = async (address) => {
    try {
        const url = `https://api.blockcypher.com/v1/btc/main/addrs/${address}?unspentOnly=true`;
        const response = await axios.get(url);
        const data = response.data.txrefs;  // List of UTXOs
        if (data) {
            return data
        } else {
            return []
        }
    } catch (error) {
        console.error("Error fetching UTXOs:", error);
        return [];
    }
};

// Estimate the transaction size (in bytes)
const estimateTxSize = (inputCount, outputCount) => {
    return (inputCount * 148) + (outputCount * 34) + 10; // Inputs + Outputs + Overhead
};

// Function to check if an address is sending or receiving
const parseTransaction = (tx, address) => {
    let isSending = false;
    let isReceiving = false;
    let totalReceived = 0;
    let totalSent = 0;

    // Check inputs (to see if address is sending)
    tx.vin.forEach(input => {
        if (input.prevout.scriptpubkey_address === address) {
            isSending = true;
            totalSent += input.prevout.value;
        }
    });

    // Check outputs (to see if address is receiving)
    tx.vout.forEach(output => {
        if (output.scriptpubkey_address === address) {
            isReceiving = true;
            totalReceived += output.value;
        }
    });

    return {
        isSending,
        isReceiving,
        totalSent,
        totalReceived
    };
};
exports.getTransactionsForAddress = async (address) => {
    try {
        const response = await axios.get(`https://blockstream.info/api/address/${address}/txs`);
        const transactions = response.data;

        // Process each transaction
        const categorizedTransactions = transactions.map(tx => {
            const { isSending, isReceiving, totalSent, totalReceived } = parseTransaction(tx, address);

            return {
                txid: tx.txid,
                fee: tx.fee,
                time: new Date(tx.status.block_time * 1000),  // Convert timestamp to readable time
                confirmed: tx.status.confirmed,
                type: isSending ? 'send' : 'receive',
                amount: isSending ? totalSent / 100000000 : totalReceived / 100000000,  // Convert satoshis to BTC
            };
        });
        return categorizedTransactions;
    } catch (error) {
        return []
    }
};

// Broadcast the transaction using BlockCypher API (or any other service)
const broadcastTransaction = async (rawTx) => {
    try {
        const url = 'https://api.blockcypher.com/v1/btc/main/txs/push';
        const response = await axios.post(url, {tx: rawTx});
        console.log('Transaction broadcasted:', response.data);
        return response.data
    } catch (error) {
        console.error('Error broadcasting transaction:', error.response ? error.response.data : error.message);
    }
};

const estimateBitcoinFee = async (numInputs, numOutputs, priority) => {
    try {
        // Fetch fee rates (satoshis per byte) from Blockstream
        const btcPrice = await this.getBitcoinPrice();
        const feeRates = await axios.get('https://blockstream.info/api/fee-estimates');

        let fee_rate;
        if (priority === 'low')  {
            fee_rate = feeRates.data['10']
        } else if (priority === 'medium') {
            fee_rate = feeRates.data['5']
        } else if (priority === 'high') {
            fee_rate = feeRates.data['1']
        } else {
            return {
                success: false,
                error: "Invalid priority; use: low | medium | high ",
            }
        }

        // Estimate transaction size (P2PKH transaction size approximation)
        const txSize = (numInputs * 148) + (numOutputs * 34) + 10;

        // Calculate fee (in satoshis)
        const fee = txSize * fee_rate;

        // Convert fee to BTC
        const feeInBTC = fee * 0.00000001;

        return {
            success: true,
            btc: feeInBTC,
            usd: feeInBTC * btcPrice.price,
            satoshis: fee
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        }
    }
};

exports.sendBitcoin = async (data) => {
    const btcPrice = await this.getBitcoinPrice();
    const utxos = await this.getUTXOs(data.sender_address.toString());

    if (!utxos || utxos.length === 0) {
        return{
            success: false,
            error: 'No bitcoins available for the address.'
        };
    }

    if (!btcPrice.success) {
        return{
            success: false,
            error: 'There was an error getting btc price.',
        };
    }


    let amount = (data.amount / btcPrice.price) * 100000000;
    let current_balance_satoshis = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
    let current_balance_usd =  (current_balance_satoshis * btcPrice.price) / 100000000


    // Calculate dynamic fee based on inputs and outputs
    const inputCount = utxos.length;
    const outputCount = 2; // 1 for recipient, 1 for change
    let fee = 1000;
    const estimate_bitcoin_fee = await estimateBitcoinFee(inputCount, outputCount);
    if(estimate_bitcoin_fee.success){
        fee = estimate_bitcoin_fee.satoshis;
    }
    let fee_usd = (fee * btcPrice.price) / 100000000

    //console.log(`Fee: ${fee_usd} USD`)
    //console.log(`Balance: ${current_balance_usd} USD`)
    //console.log(`utxos: `, utxos)
    //return;

    if(data.amount + fee_usd > current_balance_usd){
        return {
            success: false,
            error: `Insufficient btc balance for this address. Balance:${current_balance_usd.toFixed(2)} | Fee:${fee_usd.toFixed(2)}`
        }
    }

    // Create a new transaction
    const transaction = new bitcore.Transaction();

    // Add UTXOs as inputs
    utxos.forEach(utxo => {
        transaction.from({
            txId: utxo.tx_hash,
            outputIndex: utxo.tx_output_n,
            address: data.sender_address,
            script: bitcore.Script.buildPublicKeyHashOut(data.sender_address),
            satoshis: utxo.value
        });
    });

    //console.log(parseInt(amount.toFixed(0)))
    //return;

    const formatted_amount = parseInt(amount.toFixed(0))
    // Add the recipient address and amount to send
    transaction.to(data.receiver_address, formatted_amount);

    // Send the change back to the sender address
    const totalInput = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
    const change = totalInput - formatted_amount - fee;

    if (change > 0) {
        transaction.change(data.sender_address);
    }

    // Set the dynamically calculated fee
    transaction.fee(fee);

    // Sign the transaction with the private key
    transaction.sign(data.private_key);

    // Serialize the transaction to broadcast
    const serializedTx = transaction.serialize();
    //console.log('Serialized transaction:', serializedTx);

    // Broadcast the transaction (use a blockchain API to broadcast it)
    const result = await broadcastTransaction(serializedTx);
    return {
        success: true,
        ...result
    }
};


exports.initializeBitcoinPayment = async (data) => {
  try{

      const satoshisAmount = await this.convertUSDToSatoshis(data.amount);
      const account = await this.createAccount();

      const uriString = new bitcore.URI({
          address: account.address,
          amount : satoshisAmount.price, // in satoshis
          message: data.message
      });

      const qr_code = await QRCode.toDataURL(uriString.toString());

      const privateKey = new bitcore.PrivateKey(account.privateKey);

      return {
          uri: uriString.toString(),
          private_key: account.privateKey,
          private_key_exported: privateKey.toWIF(),
          address: account.address,
          qr_code: qr_code,
          crypto_amount: bitcore.Unit.fromSatoshis(satoshisAmount.price).toBTC(),
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
            receiver_address: account3.address,
            amount: 32
        }

        //result = await this.createAccount()
        //result = await this.checkBalance(account1.address)
        //result = await this.getBitcoinPrice()
        //result = await this.convertBTCtoUSD(0.0015655)
        //result = await this.convertUSDtoBTC(97.28)
        //result = await this.convertSatoshisToUSD(1606.1934820668498)
        //result = await this.convertUSDToSatoshis(97.28)
        //result = await this.getUTXOs(account1.address)
        //result = await this.sendBitcoin(data);

        //result = await estimateBitcoinFee(1, 2, 'low')

        //result = await this.getTransactionsForAddress(account2.address)

        /*result = await this.initializeBitcoinPayment({
            amount: 100,
            message: 'Bitcoin Payment',
        })*/

        //const privateKey = new bitcore.PrivateKey("c42713ce4ba7072dff0dfdc918a2b6d16a316ffdfe3ab7269c158bbf1d322c28");
        //result = privateKey.toWIF();

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