let web3;
let currentAccount = null;

// Conectar a Ganache al cargar la página
window.addEventListener('load', async () => {
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    try {
        if (await web3.eth.net.isListening()) {
            console.log("Conectado a Ganache en http://127.0.0.1:7545");
            document.getElementById('menu').style.display = 'block';
        } else {
            alert('Error al conectar a Ganache. Asegúrate de que Ganache esté en ejecución.');
        }
    } catch (error) {
        alert('Error al conectar a Ganache. Asegúrate de que Ganache esté en ejecución.');
        console.error(error);
    }
});

// Mostrar el formulario para importar la cuenta
function mostrarImportar() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('importForm').style.display = 'block';
    document.getElementById('sendForm').style.display = 'none';
    document.getElementById('accountInfo').style.display = 'none';
    document.getElementById('blockExplorer').style.display = 'none';
    document.getElementById('backBtn').style.display = 'block';
}

// Mostrar el formulario para enviar ETH
function mostrarEnviarETH() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('sendForm').style.display = 'block';
    document.getElementById('importForm').style.display = 'none';
    document.getElementById('accountInfo').style.display = 'none';
    document.getElementById('blockExplorer').style.display = 'none';
    document.getElementById('backBtn').style.display = 'block';
}

// Mostrar el menú principal
function volverAlMenu() {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('importForm').style.display = 'none';
    document.getElementById('sendForm').style.display = 'none';
    document.getElementById('accountInfo').style.display = 'none';
    document.getElementById('blockExplorer').style.display = 'none';
    document.getElementById('backBtn').style.display = 'none';
}

// Mostrar el explorador de bloques
function mostrarExploradorDeBloques() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('blockExplorer').style.display = 'block';
    document.getElementById('importForm').style.display = 'none';
    document.getElementById('sendForm').style.display = 'none';
    document.getElementById('accountInfo').style.display = 'none';
    document.getElementById('backBtn').style.display = 'block';

    obtenerBloques();
}

// Obtener información de los bloques
async function obtenerBloques() {
    const blocksDiv = document.getElementById('blocks');
    blocksDiv.innerHTML = '';

    try {
        const latestBlockNumber = Number(await web3.eth.getBlockNumber());
        for (let i = latestBlockNumber; i >= 0 && i > latestBlockNumber - 10; i--) {
            const block = await web3.eth.getBlock(i);
            const blockElement = document.createElement('div');
            blockElement.innerHTML = `
                <h3>Bloque #${block.number}</h3>
                <p>Minado en: ${new Date(Number(block.timestamp) * 1000).toLocaleString()}</p>
                <p>Gas Usado: ${block.gasUsed}</p>
                <p>${block.transactions.length} Transacción(es)</p>
                <button onclick="mostrarDetalleBloque(${block.number})">Ver Detalles</button>
            `;
            blocksDiv.appendChild(blockElement);
        }
    } catch (error) {
        console.error("Error al obtener los bloques:", error);
        alert(`Error al obtener los bloques. Verifique la conexión. Detalles: ${error.message}`);
    }
}

// Consultar saldo de la cuenta importada
function consultarSaldo() {
    if (currentAccount) {
        web3.eth.getBalance(currentAccount.address)
            .then(balance => {
                document.getElementById('accountInfo').style.display = 'block';
                document.getElementById('accountAddress').innerText = `Dirección de la cuenta: ${currentAccount.address}`;
                document.getElementById('accountBalance').innerText = `Saldo actual: ${web3.utils.fromWei(balance, 'ether')} ETH`;
            })
            .catch(error => {
                console.error("Error al consultar el saldo:", error);
            });
    } else {
        alert("Primero debe importar una cuenta.");
    }
}

// Enviar transacción
function enviarTransaccion() {
    const receiverAddress = document.getElementById('receiverAddressInput').value;
    const amount = document.getElementById('amountInput').value;

    if (!web3.utils.isAddress(receiverAddress)) {
        alert("Dirección de destino no válida.");
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
                        gasPrice: web3.utils.toWei('20', 'gwei'), // Precio del gas
                        chainId: web3.eth.chainId
                    };

                    web3.eth.accounts.signTransaction(transaction, currentAccount.privateKey)
                        .then(signedTx => web3.eth.sendSignedTransaction(signedTx.rawTransaction))
                        .then(receipt => {
                            alert("ETH enviado exitosamente.");
                        })
                        .catch(error => {
                            console.error("Error al enviar la transacción:", error);
                            alert("Error al enviar la transacción. Verifique la conexión y la cuenta.");
                        });
                })
                .catch(error => {
                    console.error("Error al obtener el nonce:", error);
                    alert("Error al obtener el nonce. Verifique la conexión y la cuenta.");
                });
        } catch (error) {
            alert("Error al enviar la transacción. Verifique la conexión y la cuenta.");
            console.error("Error al enviar la transacción:", error);
        }
    } else {
        alert("Primero debe importar una cuenta.");
    }
}

// Importar cuenta
function importarCuenta() {
    const accountAddress = document.getElementById('accountAddressInput').value;
    const privateKey = document.getElementById('privateKeyInput').value;

    if (!web3.utils.isAddress(accountAddress)) {
        alert("Dirección de cuenta no válida.");
        return;
    }

    try {
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        if (account.address.toLowerCase() !== accountAddress.toLowerCase()) {
            alert("La clave privada no corresponde a la dirección proporcionada.");
            return;
        }

        currentAccount = {
            address: accountAddress,
            privateKey: privateKey
        };

        document.getElementById('importForm').style.display = 'none';
        document.getElementById('accountInfo').style.display = 'block';
        document.getElementById('accountAddress').innerText = `Dirección de la cuenta: ${currentAccount.address}`;
        consultarSaldo();

        alert("Cuenta importada correctamente!");
    } catch (error) {
        alert("Clave privada no válida.");
        console.error("Error al importar la cuenta:", error);
    }
}