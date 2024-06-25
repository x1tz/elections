# Consensus Algorithm
- IBFT 2.0 Proof of Authority: 
    > Approved accounts, known as validators, validate transactions and blocks. Validators take turns to create the next block. Before inserting the block on the chain, a  super-majority (greater than or equal to 2/3) of validators must first sign the block.

- QBFT

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


assert vs require

----------------------------------------------------
----------------- TO DOS ---------------------------
----------------------------------------------------

# TODO - DONE
- verificar se ja votou (validacao) -- CHECK
- facilitar votos (args consola/postman)-- todo
- hashmap votadores (hashs), ter lista no script e envir como arg para um initializer da hashmap? -- CHECK
- automatizar address do smart contract -- CHECK
- proxy (X segundos):
    Agora: Execute por ordem ids e votos
    Futuro: Sincronizar transacoes tanto IDs como Votos, para nao haver collisions -- todo
- contador (fim) -- CHECK

# 17/05 
- assert / require no addID(); -- CHECK
- random() no shuffle revisto; -- CHECK
- leitura do txt file ids e votos; -- CHECK
- Counter candidatos validos (resto Blank Vote); -- CHECK
- status SC(mudar status tem logica em comentario para debug) -- CHECK
Criar file para mudar status em vez de no codigo

# DOING:
- proxy checkar 1 em 1seg setInterval a list e assim consegue receber msg do parent?

# ------------------- 25/06 -----------

# Current State: 
    - Funciona como esperado (events, encrypt, decrypt, count)
# fastAPI:
- Emite evento para voto e stop 1x

TODO: Profiling











# Encrypt
- Cypheriv

https://www.geeksforgeeks.org/node-js-crypto-createcipheriv-method/





# Executar
- FastAPI: fastapi dev eth_api.py
- Quorum Blockchain: ./run.sh
- Javascripts: node name.js (SC_deploy, SC_Init ,Voting, Counter)


# Atencao
- ligacao ao smart contract necessita ABI do mesmo

# Ordem sistema
- Deploy SC
- Inicializar lista de eligible voters
- Verificar ID votador
- Adicionar ID votador
- Enviar Vote Proxy
- Proxy envia Vote para blockchain
- Contador























# Instalacoes feitas
- installing ethereum/solidity (brew and npm)
- npm install web3
- npm install fs-extra
- npm ethereum-input-data-decoder
- npm install express
- brew install ...
- npm install eventsource