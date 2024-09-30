const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Adicionando nodemailer para envio de email

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname));

// Configuração para envio de email
const transporter = nodemailer.createTransport({
    service: 'gmail', // Ou o serviço de e-mail que você está usando
    auth: {
        user: '', // Substitua pelo seu email
        pass: '' // Substitua pela sua senha ou app password
    }
});



// Função para validar CPF (mantida do exemplo anterior)
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }
    let soma = 0, resto;

    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

// Função para criar a tabela e inserir dados (mantida do exemplo anterior)
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

// Rota para enviar o código de verificação
app.post('/enviarCodigo', async (req, res) => {
    const { email, codigo } = req.body;

    const enviado = await enviarCodigoEmail(email, codigo);

    if (enviado) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Rota para receber os dados do formulário (mantida do exemplo anterior)
app.post('/enviarDados', async (req, res) => {
    const { nome, sobreNome, email, cpf } = req.body;

    if (!nome || !sobreNome || !email || !cpf) {
        return res.json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    if (!validarCPF(cpf)) {
        return res.json({ success: false, message: 'CPF inválido.' });
    }

    try {
        await criarEPopularTabelaUsuario(nome, sobreNome, email, cpf);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao inserir os dados:', error);
        res.json({ success: false, message: 'Erro ao inserir os dados.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
