let web3;
let currentAccount = null;

// Conectar a Ganache al cargar la página
window.addEventListener('load', async () => {
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    try {
        if (await web3.eth.net.isListening()) {
            console.log("Connected to Ganache at http://127.0.0.1:7545");
            document.getElementById('menu').style.display = 'block';
        } else {
            alert('Error connecting to Ganache. Make sure Ganache is running.');
        }
    } catch (error) {
        alert('Error connecting to Ganache. Make sure Ganache is running.');
        console.error(error);
    }
});

// Mostrar el formulario para importar la cuenta
function showImportForm() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('importForm').style.display = 'block';
    document.getElementById('sendForm').style.display = 'none';
    document.getElementById('accountInfo').style.display = 'none';
    document.getElementById('blockExplorer').style.display = 'none';
    document.getElementById('txDetails').style.display = 'none';
    document.getElementById('backBtn').style.display = 'block';
}

// Mostrar el formulario para enviar ETH
function showSendETHForm() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('sendForm').style.display = 'block';
    document.getElementById('importForm').style.display = 'none';
    document.getElementById('accountInfo').style.display = 'none';
    document.getElementById('blockExplorer').style.display = 'none';
    document.getElementById('txDetails').style.display = 'none';
    document.getElementById('backBtn').style.display = 'block';
}

// Mostrar el menú principal
function backToMenu() {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('importForm').style.display = 'none';
    document.getElementById('sendForm').style.display = 'none';
    document.getElementById('accountInfo').style.display = 'none';
    document.getElementById('blockExplorer').style.display = 'none';
    document.getElementById('txDetails').style.display = 'none';
    document.getElementById('backBtn').style.display = 'none';
}

// Mostrar el explorador de bloques
function showBlockExplorer() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('blockExplorer').style.display = 'block';
    document.getElementById('importForm').style.display = 'none';
    document.getElementById('sendForm').style.display = 'none';
    document.getElementById('accountInfo').style.display = 'none';
    document.getElementById('txDetails').style.display = 'none';
    document.getElementById('backBtn').style.display = 'block';

    getBlocks();
}

// Obtener información de los bloques
async function getBlocks() {
    const blocksDiv = document.getElementById('blocks');
    blocksDiv.innerHTML = '';

    try {
        const latestBlockNumber = Number(await web3.eth.getBlockNumber());
        for (let i = latestBlockNumber; i >= 0 && i > latestBlockNumber - 10; i--) {
            const block = await web3.eth.getBlock(i);
            const blockElement = document.createElement('div');
            blockElement.className = 'block';

            // Crear el botón del acordeón
            const accordionButton = document.createElement('button');
            accordionButton.className = 'accordion';
            accordionButton.innerHTML = `Block #${block.number}`; // Texto del botón en inglés

            // Crear el panel del acordeón
            const panelDiv = document.createElement('div');
            panelDiv.className = 'panel';
            panelDiv.innerHTML = `
                <p>Mined on: ${new Date(Number(block.timestamp) * 1000).toLocaleString()}</p>
                <p>Gas Used: ${block.gasUsed.toString()}</p>
                <p>Block Hash: ${block.hash}</p>
                <p>Number of Transactions: ${block.transactions.length}</p>
                <div class="transactions">
                    ${block.transactions.map(txHash => `
                        <div class="transaction">
                            <p>TX Hash: ${txHash}</p>
                            <button onclick="showTransactionDetails('${txHash}', this)" class="details-button">View Details</button> 
                            <div class="tx-details hidden"></div>
                        </div>
                    `).join('')}
                </div>
            `;

            // Agregar el evento de clic al botón del acordeón
            accordionButton.addEventListener('click', function() {
                this.classList.toggle('active');
                const panel = this.nextElementSibling;
                if (panel.style.display === 'block') {
                    panel.style.display = 'none';
                } else {
                    panel.style.display = 'block';
                }
            });

            // Agregar el botón y el panel al elemento del bloque
            blockElement.appendChild(accordionButton);
            blockElement.appendChild(panelDiv);

            // Agregar el elemento del bloque al contenedor de bloques
            blocksDiv.appendChild(blockElement);
        }
    } catch (error) {
        console.error("Error al obtener los bloques:", error); 
        alert(`Error getting blocks. Check the connection. Details: ${error.message}`);
    }
}

// Consultar saldo de la cuenta importada
function checkBalance() {
    if (currentAccount) {
        web3.eth.getBalance(currentAccount.address)
            .then(balance => {
                document.getElementById('accountInfo').style.display = 'block';
                document.getElementById('accountAddress').innerText = `Account Address: ${currentAccount.address}`; 
                document.getElementById('accountBalance').innerText = `Current Balance: ${web3.utils.fromWei(balance, 'ether')} ETH`; 
            })
            .catch(error => {
                console.error("Error al consultar el saldo:", error); 
            });
    } else {
        alert("You must first import an account."); 
    }
}

// Enviar transacción
function sendTransaction() {
    const receiverAddress = document.getElementById('receiverAddressInput').value;
    const amount = document.getElementById('amountInput').value;

    if (!web3.utils.isAddress(receiverAddress)) {
        alert("Invalid recipient address."); 
        return;
    }

    if (currentAccount) {
        try {
            // Obtener el nonce de la cuenta
            web3.eth.getTransactionCount(currentAccount.address, 'pending')
                .then(nonce => {
                    const transaction = {
                        nonce: nonce,
                        to: receiverAddress,
                        value: web3.utils.toWei(amount, 'ether'),
                        gas: 21000, // Límite de gas
                        gasPrice: web3.utils.toWei('20', 'gwei'), 
                        chainId: web3.eth.chainId
                    };

                    web3.eth.accounts.signTransaction(transaction, currentAccount.privateKey)
                        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
                        .then(receipt => {
                            alert("ETH sent successfully."); 
                        })
                        .catch(error => {
                            console.error("Error sending the transaction:", error); 
                            alert("Error sending the transaction. Check the connection and the account.");
                        });
                })
                .catch(error => {
                    console.error("Error obtaining the nonce:", error); 
                    alert("Error obtaining the nonce. Check the connection and the account.");
                });
        } catch (error) {
            alert("Error sending the transaction. Check the connection and the account.");
            console.error("Error sending the transaction:", error);
        }
    } else {
        alert("You must first import an account."); 
    }
}

// Importar cuenta
function importAccount() {
    const accountAddress = document.getElementById('accountAddressInput').value;
    const privateKey = document.getElementById('privateKeyInput').value;

    if (!web3.utils.isAddress(accountAddress)) {
        alert("Invalid account address."); 
        return;
    }

    try {
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        if (account.address.toLowerCase() !== accountAddress.toLowerCase()) {
            alert("The private key does not match the provided address."); 
            return;
        }

        currentAccount = {
            address: accountAddress,
            privateKey: privateKey
        };

        document.getElementById('importForm').style.display = 'none';
        document.getElementById('accountInfo').style.display = 'block';
        document.getElementById('accountAddress').innerText = `Account Address: ${currentAccount.address}`; 
        checkBalance();

        alert("Account imported successfully!"); 
    } catch (error) {
        alert("Invalid private key."); 
        console.error("Error importing the account:", error); 
    }
}

// Función para mostrar los detalles de una transacción
async function showTransactionDetails(txHash, button) {
    try {
        const tx = await web3.eth.getTransaction(txHash);
        if (!tx) {
            throw new Error("Transaction not found"); 
        }

        const txDetailsDiv = button.nextElementSibling;
        txDetailsDiv.innerHTML = `
            <h3>Transaction Details</h3> 
            <p>Hash: ${tx.hash}</p>
            <p>From: ${tx.from}</p>
            <p>To: ${tx.to}</p>
            <p>Amount: ${web3.utils.fromWei(tx.value.toString(), 'ether')} ETH</p>
            <p>Gas Used: ${tx.gasUsed ? tx.gasUsed.toString() : 'N/A'}</p>
            <p>Nonce: ${tx.nonce ? tx.nonce.toString() : 'N/A'}</p>
        `;
        txDetailsDiv.classList.toggle('hidden');
    } catch (error) {
        console.error("Error getting transaction details:", error); 
        alert(`Error getting transaction details. Check the connection. Details: ${error.message}`);
    }
}

// Ocultar detalles de la transacción
function hideTransactionDetails() {
    const txDetailsDiv = document.getElementById('txDetails');
    txDetailsDiv.style.display = 'none';
}