const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json()); // Middleware para processar JSON
app.use(express.static(__dirname)); // Serve os arquivos estáticos (HTML e CSS)

// Função para criar a tabela e inserir dados
async function criarEPopularTabelaUsuario(nome, sobreNome, email, cpf) {
    const db = await open({
        filename: './banco.db',
        driver: sqlite3.Database,
    });

    await db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            sobreNome TEXT,
            email TEXT,
            cpf TEXT
        )
    `);

    await db.run(`INSERT INTO clientes (nome, sobreNome, email, cpf) VALUES (?, ?, ?, ?)`, 
        [nome, sobreNome, email, cpf]);

    console.log('Usuário inserido com sucesso!');
}

// Rota para receber os dados do formulário
app.post('/enviarDados', async (req, res) => {
    const { nome, sobreNome, email, cpf } = req.body;

    if (!nome || !sobreNome || !email || !cpf) {
        return res.json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        await criarEPopularTabelaUsuario(nome, sobreNome, email, cpf);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao inserir usuário:', error);
        res.json({ success: false });
    }
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
