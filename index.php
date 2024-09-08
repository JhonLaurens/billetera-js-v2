<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Billetera JS</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>Billetera JS</h1>
            <p class="copyright">© JhonLaurens 2024</p>
        </header>
        <main>
            <div id="menu">
                <button type="button" onclick="showImportForm()" id="importBtn">Import Account</button>
                <button type="button" onclick="checkBalance()" id="balanceBtn">Check Balance</button>
                <button type="button" onclick="showSendETHForm()" id="sendBtn">Send ETH</button>
                <button type="button" onclick="showBlockExplorer()" id="explorerBtn">Block Explorer</button>
            </div>
            <div id="importForm" class="hidden">
                <label for="accountAddressInput" id="accountAddressLabel">Account Address:</label>
                <input type="text" id="accountAddressInput" placeholder="0x...">
                <label for="privateKeyInput" id="privateKeyLabel">Private Key:</label>
                <input type="password" id="privateKeyInput" placeholder="...">
                <button type="button" onclick="importAccount()" id="importAccountBtn">Import Account</button>
            </div>
            <div id="sendForm" class="hidden">
                <label for="receiverAddressInput" id="receiverAddressLabel">Recipient Address:</label>
                <input type="text" id="receiverAddressInput" placeholder="0x...">
                <label for="amountInput" id="amountLabel">Amount of ETH:</label>
                <input type="text" id="amountInput" placeholder="0.0">
                <button type="button" onclick="sendTransaction()" id="sendTransactionBtn">Send ETH</button>
            </div>
            <div id="accountInfo" class="hidden">
                <p id="accountAddress">Account Address:</p>
                <p id="accountBalance">Current Balance:</p>
                <!-- Botón para actualizar el balance (opcional) -->
                <button type="button" onclick="checkBalance()" id="updateBalanceBtn">Update Balance</button>
            </div>
            <div id="blockExplorer" class="hidden">
                <h2>Block Explorer</h2>
                <div id="blocks"></div>
            </div>
            <div id="output"></div>
            <button id="backBtn" class="hidden" type="button" onclick="backToMenu()">Back</button>

            <!-- Nuevo contenedor para los detalles de la transacción -->
            <div id="txDetails" class="hidden"></div>
        </main>
    </div>
    <script src="script.js"></script>
</body>
</html>