'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');


// Web3
const Web3 = require("web3");
const web3 = new Web3(
  new Web3.providers.HttpProvider("http://localhost:22000")
);

const quorumjs = require("quorum-js");

const accAddress = "ed9d02e382b34818e88b88a309c7fe71e65f419d";

const signAcct = web3.eth.accounts.decrypt(
  {
    address: accAddress,
    crypto: {
      cipher: "aes-128-ctr",
      ciphertext:
        "4e77046ba3f699e744acb4a89c36a3ea1158a1bd90a076d36675f4c883864377",
      cipherparams: { iv: "a8932af2a3c0225ee8e872bc0e462c11" },
      kdf: "scrypt",
      kdfparams: {
        dklen: 32,
        n: 262144,
        p: 1,
        r: 8,
        salt: "8ca49552b3e92f79c51f2cd3d38dfc723412c212e702bd337a3724e8937aff0f"
      },
      mac: "6d1354fef5aa0418389b1a5d1f5ee0050d7273292a1171c51fd02f9ecff55264"
    },
    id: "a65d1ac3-db7e-445d-a1cc-b6c5eeaa05e0",
    version: 3
  },
  ""
);

const abi = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "x",
          "type": "string"
        }
      ],
      "name": "sendHash",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getHash",
      "outputs": [
        {
          "name": "x",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ];

const bytecode =
  "0x608060405234801561001057600080fd5b50600436106100365760003560e01c8063d13319c41461003b578063dfb29935146100be575b600080fd5b610043610179565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610083578082015181840152602081019050610068565b50505050905090810190601f1680156100b05780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b610177600480360360208110156100d457600080fd5b81019080803590602001906401000000008111156100f157600080fd5b82018360208201111561010357600080fd5b8035906020019184600183028401116401000000008311171561012557600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050919291929050505061021b565b005b606060008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156102115780601f106101e657610100808354040283529160200191610211565b820191906000526020600020905b8154815290600101906020018083116101f457829003601f168201915b5050505050905090565b8060009080519060200190610231929190610235565b5050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061027657805160ff19168380011785556102a4565b828001600101855582156102a4579182015b828111156102a3578251825591602001919060010190610288565b5b5090506102b191906102b5565b5090565b6102d791905b808211156102d35760008160009055506001016102bb565b5090565b9056fea165627a7a72305820b4fd23673585ff06c0d1bb31f1d7ef81898890eaff3fe2ed730fbda2303709ee0029";

const storeHashContract = new web3.eth.Contract(abi);

const bytecodeDeployed = storeHashContract
  .deploy({ data: bytecode, })
  .encodeABI();
  console.log(bytecodeDeployed)


// const bytecodeWithInitParam = simpleContract.methods
//   .set(80)
//   .encodeABI();
// console.log(bytecodeWithInitParam)


// console.log(bytecodeWithInitParam)
// const tessera = quorumjs.enclaves.Tessera(
//   web3,
//   "http://localhost:9081",
//   "http://localhost:9081"
// );

const rawTransactionManager = quorumjs.RawTransactionManager(web3, {
  privateUrl: "http://localhost:9081"
});

web3.eth.getTransactionCount(`0x${accAddress}`).then(txCount => {
  console.log("enter")
  const newTx = rawTransactionManager.sendRawTransaction({
    gasPrice: 0,
    gasLimit: 4300000,
    to: "",
    value: 0,
    data: bytecodeDeployed,
    from: signAcct,
    isPrivate: true,
    privateFrom: "BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHII3ZKBey3Bo=",
    privateFor: ["ROAZBWtSacxXQrOe3FGAqJDyJjFePR5ce4TSIzmJ0Bc="],
    nonce: txCount
  });

  newTx.then(tx => {
      console.log("transaction is ", tx);
      console.log("Contract address: ", tx.contractAddress);
      // return tx.contractAddress;

    })
    .catch(console.log);
}); 


// Creat eour application.
const app = express();

// Add Middleware necessary for REST API's
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));

app.post('/*', (req, res, next) => {
  // Simple usecase.
  if (req.body.request.data.text === '1') {
    return res.status(400).send('Error 1');
  }

  // Custom error code.
  if (req.body.request.data.text === '2') {
    return res.status(401).send('Error 2');
  }

  // Error message.
  if (req.body.request.data.text === '3') {
    return res.status(400).send({
      message: 'Error 3'
    });
  }

  // No content.
  if (req.body.request.data.text === '4') {
    return res.status(400).end();
  }

  if (req.body.request.data.text === '5') {
    return res.status(400).send({
      details: [
        {
          message: 'Incorrect text value provided',
          path: ['text'],
        },
      ],
      name: 'ValidationError',
    });
  }

web3.eth.getTransactionCount(`0x${accAddress}`).then(txCount => {
  console.log("enter")
  const newTx = rawTransactionManager.sendRawTransaction({
    gasPrice: 0,
    gasLimit: 4300000,
    to: "",
    value: 0,
    data: bytecodeDeployed,
    from: signAcct,
    isPrivate: true,
    privateFrom: "BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHII3ZKBey3Bo=",
    privateFor: ["ROAZBWtSacxXQrOe3FGAqJDyJjFePR5ce4TSIzmJ0Bc="],
    nonce: txCount
  });

  newTx.then(tx => {
      console.log("transaction is ", tx);
      console.log("Contract address: ", tx.contractAddress);
      // return tx.contractAddress;

    })
    .catch(console.log);
}); 

  console.log(req.body); // eslint-disable-line no-console
  return res.sendStatus(200);
});

module.exports = app;
