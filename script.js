const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

web3.eth.net.isListening()
  .then(() => console.log('Connected to Ganache'))
  .catch(e => console.log('Something went wrong', e));

let currentAccount = null;

// Función para mostrar el formulario de importación de cuentas
async function showImportForm() {
  document.getElementById('importForm').classList.remove('hidden');
  document.getElementById('menu').classList.add('hidden');
}

// Función para importar una cuenta
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
    checkBalance(); // Actualiza el balance después de importar

    // Enviar datos al backend
    fetch('db.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'insertAccount',
        address: accountAddress,
        privateKey: privateKey,
        balance: 0 // Actualiza el balance después de consultar
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        alert("Account imported and stored in the database successfully!");
      } else {
        alert("Error importing account: " + data.message);
      }
    })
    .catch(error => {
      console.error("Error in fetch operation:", error);
      alert("Error importing account. Please try again.");
    });

  } catch (error) {
    alert("Invalid private key.");
    console.error("Error importing the account:", error);
  }
}

// Función para verificar el balance
function checkBalance() {
  web3.eth.getBalance(currentAccount.address)
  .then(balance => {
    const balanceEth = web3.utils.fromWei(balance, 'ether');
    document.getElementById('accountBalance').innerText = `Current Balance: ${balanceEth} ETH`;

    // Actualiza el balance en la base de datos después de consultar
    fetch('db.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'updateBalance', // Puedes usar una nueva acción para actualizar el balance
        address: currentAccount.address,
        balance: balanceEth
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        console.log("Balance updated in the database!");
      } else {
        console.error("Error updating balance: " + data.message);
      }
    })
    .catch(error => {
      console.error("Error in fetch operation:", error);
      alert("Error updating balance. Please try again.");
    });

  })
  .catch(error => {
    console.error("Error getting balance:", error);
    alert(`Error getting balance. Check the connection. Details: ${error.message}`);
  });
}

// Función para enviar una transacción
function sendTransaction() {
  const receiverAddress = document.getElementById('receiverAddressInput').value;
  const amountEth = document.getElementById('amountInput').value;

  if (!web3.utils.isAddress(receiverAddress)) {
    alert("Invalid recipient address.");
    return;
  }

  const amountWei = web3.utils.toWei(amountEth, 'ether');

  web3.eth.sendTransaction({
    from: currentAccount.address,
    to: receiverAddress,
    value: amountWei
  })
  .then(txHash => {
    alert(`Transaction sent! Hash: ${txHash}`);

    // Enviar datos de la transacción al backend
    fetch('db.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'insertTransaction',
        txHash: txHash,
        blockId: null, // Puedes actualizar esto después de obtener el blockId
        fromAddress: currentAccount.address,
        toAddress: receiverAddress,
        amount: amountEth,
        gasUsed: null, // Puedes actualizar esto después de obtener el gasUsed
        nonce: null // Puedes actualizar esto después de obtener el nonce
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        alert("Transaction stored in the database successfully!");
      } else {
        alert("Error storing transaction: " + data.message);
      }
    })
    .catch(error => {
      console.error("Error in fetch operation:", error);
      alert("Error storing transaction. Please try again.");
    });

  })
  .catch(error => {
    console.error("Error sending transaction:", error);
    alert(`Error sending transaction. Check the connection. Details: ${error.message}`);
  });
}

// Función para mostrar el formulario de envío de ETH
function showSendETHForm() {
  document.getElementById('sendForm').classList.remove('hidden');
  document.getElementById('menu').classList.add('hidden');
}

// Función para volver al menú principal
function backToMenu() {
  document.getElementById('importForm').classList.add('hidden');
  document.getElementById('sendForm').classList.add('hidden');
  document.getElementById('accountInfo').classList.add('hidden');
  document.getElementById('blockExplorer').classList.add('hidden');
  document.getElementById('menu').classList.remove('hidden');
}

// Función para mostrar el Block Explorer
async function showBlockExplorer() {
  document.getElementById('blockExplorer').classList.remove('hidden');
  document.getElementById('menu').classList.add('hidden');
  await getBlocks();
}

// Función para obtener información de los bloques
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
      accordionButton.innerHTML = `Block #${block.number}`;

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

      // Enviar datos del bloque al backend
      fetch('db.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'insertBlock',
          blockNumber: block.number,
          minedOn: new Date(Number(block.timestamp) * 1000).toISOString(),
          gasUsed: block.gasUsed,
          blockHash: block.hash,
          numTransactions: block.transactions.length
        })
      }).then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log("Block inserted successfully!");
          } else {
            console.error("Error inserting block: " + data.message);
          }
        }).catch(error => {
          console.error("Error in fetch operation:", error);
          alert("Error inserting block. Please try again.");
        });
    }
  } catch (error) {
    console.error("Error al obtener los bloques:", error);
    alert(`Error getting blocks. Check the connection. Details: ${error.message}`);
  }
}

// Función para mostrar detalles de la transacción
async function showTransactionDetails(txHash, button) {
  const txDetailsDiv = button.nextElementSibling;

  if (!txDetailsDiv.classList.contains('hidden')) {
    txDetailsDiv.classList.add('hidden');
    return;
  }

  try {
    const transaction = await web3.eth.getTransaction(txHash);
    txDetailsDiv.innerHTML = `
      <p>Hash: ${transaction.hash}</p>
      <p>From: ${transaction.from}</p>
      <p>To: ${transaction.to}</p>
      <p>Amount: ${web3.utils.fromWei(transaction.value, 'ether')} ETH</p>
      <p>Gas Used: ${transaction.gas}</p>
      <p>Nonce: ${transaction.nonce}</p>
    `;
    txDetailsDiv.classList.remove('hidden');

    // Enviar datos de la transacción al backend
    fetch('db.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'insertTransaction',
        txHash: transaction.hash,
        blockId: transaction.blockNumber,
        fromAddress: transaction.from,
        toAddress: transaction.to,
        amount: web3.utils.fromWei(transaction.value, 'ether'),
        gasUsed: transaction.gas,
        nonce: transaction.nonce
      })
    }).then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("Transaction stored in the database successfully!");
        } else {
          alert("Error storing transaction: " + data.message);
        }
      }).catch(error => {
        console.error("Error in fetch operation:", error);
        alert("Error storing transaction. Please try again.");
      });

  } catch (error) {
    console.error("Error getting transaction details:", error);
    alert(`Error getting transaction details. Check the connection. Details: ${error.message}`);
  }
}