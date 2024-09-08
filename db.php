<?php
require 'api.php';

// Manejar solicitudes POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($data['action'] === 'insertAccount') {
        $response = file_get_contents('http://localhost/api.php/accounts', false, stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/json',
                'content' => json_encode([
                    'address' => $data['address'],
                    'private_key' => $data['privateKey'],
                    'balance' => $data['balance']
                ])
            ]
        ]));
        echo $response;
    } elseif ($data['action'] === 'insertBlock') {
        $response = file_get_contents('http://localhost/api.php/blocks', false, stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/json',
                'content' => json_encode([
                    'block_number' => $data['blockNumber'],
                    'mined_on' => $data['minedOn'],
                    'gas_used' => $data['gasUsed'],
                    'block_hash' => $data['blockHash'],
                    'num_transactions' => $data['numTransactions']
                ])
            ]
        ]));
        echo $response;
    } elseif ($data['action'] === 'insertTransaction') {
        $response = file_get_contents('http://localhost/api.php/transactions', false, stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/json',
                'content' => json_encode([
                    'tx_hash' => $data['txHash'],
                    'block_id' => $data['blockId'],
                    'from_address' => $data['fromAddress'],
                    'to_address' => $data['toAddress'],
                    'amount' => $data['amount'],
                    'gas_used' => $data['gasUsed'],
                    'nonce' => $data['nonce']
                ])
            ]
        ]));
        echo $response;
    } else {
        http_response_code(400); // Código de error de solicitud
        echo json_encode(['success' => false, 'message' => 'Acción inválida']);
    }
}
?>