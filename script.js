let web3;
let currentAccount = null;

// Conectar a Ganache al cargar la página
window.addEventListener('load', async () => {
    // Conectar a Ganache usando Web3.js
    web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    try {
        if (await web3.eth.net.isListening()) {
            console.log("Conectado a Ganache en http://127.0.0.1:7545");
            // Mostrar el menú principal
            document.getElementById('menu').style.display = 'block';
        } else {
            alert('Error al conectar a Ganache. Asegúrate de que Ganache esté en ejecución.');
        }
    } catch (error) {
        alert('Error al conectar a Ganache. Asegúrate de que Ganache esté en ejecución.');
        console.error(error);
    }
});

// Función para agregar un log a la consola
function log(message) {
    const output = document.getElementById('output');
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    output.appendChild(logEntry);
}

// Mostrar el formulario para importar la cuenta
function mostrarImportar() {
    // Ocultar otros formularios y mostrar el formulario de importación
    document.getElementById('menu').style.display = 'none';
    document.getElementById('importForm').style.display = 'block';
    document.getElementById('sendForm').style.display = 'none';
    document.getElementById('accountInfo').style.display = 'none';
    document.getElementById('backBtn').style.display = 'block';

    log("Mostrando formulario de importación de cuenta.");
}

// Mostrar el formulario para enviar ETH
function mostrarEnviarETH() {
    // Ocultar otros formularios y mostrar el formulario de envío de ETH
    document.getElementById('menu').style.display = 'none';
    document.getElementById('sendForm').style.display = 'block';
    document.getElementById('importForm').style.display = 'none';
    document.getElementById('accountInfo').style.display = 'none';
    document.getElementById('backBtn').style.display = 'block';

    log("Mostrando formulario de envío de ETH.");
}

function consultarSaldo() {
    if (currentAccount) {
        web3.eth.getBalance(currentAccount.address)
            .then(balance => {
                document.getElementById('accountBalance').innerText = `Saldo actual: ${web3.utils.fromWei(balance, 'ether')} ETH`;
                log(`Saldo actual: ${web3.utils.fromWei(balance, 'ether')} ETH`);
            })
            .catch(error => {
                console.error("Error al consultar el saldo:", error);
                log("Error al consultar el saldo.");
            });
    }
}

function enviarTransaccion() {
    const receiverAddress = document.getElementById('receiverAddressInput').value;
    const amount = document.getElementById('amountInput').value;

    if (!web3.utils.isAddress(receiverAddress)) {
        alert("Dirección de destino no válida.");
        return;
    }

    try {
        const amountInWei = web3.utils.toWei(amount, 'ether');

        web3.eth.getTransactionCount(currentAccount.address)
            .then(nonce => {
                const transaction = {
                    nonce: nonce,
                    to: receiverAddress,
                    value: amountInWei,
                    gas: 21000,
                    gasPrice: web3.utils.toWei('20', 'gwei'),
                    chainId: 5777 // Network ID de Ganache
                };

                return web3.eth.accounts.signTransaction(transaction, currentAccount.privateKey);
            })
            .then(signed => {
                web3.eth.sendSignedTransaction(signed.rawTransaction)
                    .on('transactionHash', hash => {
                        document.getElementById('output').innerText = `Transacción enviada con éxito. Hash: ${hash}`;
                        log(`Transacción enviada con éxito. Hash: ${hash}`);
                    })
                    .on('receipt', receipt => {
                        console.log("Transacción confirmada. Detalles:", receipt);
                        document.getElementById('output').innerText = `Transacción confirmada en el bloque ${receipt.blockNumber}`;
                        log(`Transacción confirmada en el bloque ${receipt.blockNumber}`);
                    })
                    .on('error', error => {
                        console.error("Error al enviar la transacción:", error);
                        alert("Error al enviar la transacción. Verifica la conexión y la cuenta.");
                        log("Error al enviar la transacción.");
                    });
            })
            .catch(error => {
                console.error("Error al procesar la transacción:", error);
                alert("Error al procesar la transacción. Verifica la conexión y la cuenta.");
                log("Error al procesar la transacción.");
            });
    } catch (error) {
        console.error("Error al convertir cantidad de ETH a Wei:", error);
        alert("Error al convertir cantidad de ETH a Wei. Intenta de nuevo.");
        log("Error al convertir cantidad de ETH a Wei.");
    }
}

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

        // Ocultar el formulario de importación y mostrar la información de la cuenta
        document.getElementById('importForm').style.display = 'none';
        document.getElementById('accountInfo').style.display = 'block';

        // Mostrar la dirección de la cuenta
        document.getElementById('accountAddress').innerText = `Dirección de la cuenta: ${currentAccount.address}`;

        // Mostrar el saldo actual
        consultarSaldo();

        alert("Cuenta importada correctamente!");
        log("Cuenta importada correctamente.");
    } catch (error) {
        alert("Clave privada no válida.");
        console.error("Error al importar la cuenta:", error);
        log("Error al importar la cuenta.");
    }
}

function volverAlMenu() {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('importForm').style.display = 'none';
    document.getElementById('sendForm').style.display = 'none';
    document.getElementById('accountInfo').style.display = 'none';
    document.getElementById('backBtn').style.display = 'none';
}