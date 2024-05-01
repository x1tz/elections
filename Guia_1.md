# Consensus Algorithm
- IBFT 2.0 Proof of Authority: 
    > Approved accounts, known as validators, validate transactions and blocks. Validators take turns to create the next block. Before inserting the block on the chain, a  super-majority (greater than or equal to 2/3) of validators must first sign the block.

https://besu.hyperledger.org/private-networks/how-to/configure/consensus/ibft

# Comandos Docker Container
1. Iniciar docker container - ./run.sh
2. Remover docker container - ./remove.sh
3. Pausar docker container - ./stop.sh (voltar - ./resume.sh)

# Exemplo 1 - Transaction & Smart Contract (SimpleStorage)
/smart_contracts/scripts/public/hre_public_tx.js

- comando: node hre_public_tx.js
- Smart Contract inicializado com valor 47
- Faz update value para 123
- Verifica que o valor foi atualizado

# Exemplo 2 - Transaction A to B

- comando: node hre_eth_tx.js
- Executa uma transacao the Ether da WalletA para WalletB

----------------------------------------------------

???????????
# Transaction usar MetaMask
- Conta Member2 ou Member1 para TesteA
- Colocar hexadata e verificar na transaction
????????????


# Call for most recent block number

- curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545


# Chainlens - Block Explorer (esta com erro)

IMAGENS - https://besu.hyperledger.org/private-networks/how-to/monitor/chainlens

----------------------------------------------------
----------------------------------------------------


# Script deploy_votacao_tx.js
 - Faz deploy do smart contract na rede.

# Script votacao_tx.ks
 - Regista um voto (string) na rede

# Script getList.js
- Retorna a lista completa do smart contract

# Script getTransaction.js
- Imprime dados da transacao com base na hash da mesma

----------------------------------------------------

# Decode do input transacao

https://bia.is/tools/abi-decoder/ (usar abi do SC e input da tx)





----------------------------------------------------
----------------------------------------------------

# Como recuperar transactions?
 - Get last block number;
 - Iterar sob blocos ate ultimo
 - Ir retirando transactions dos blocks























# Instalacoes feitas
- installing ethereum/solidity (brew and npm)
- npm install web3