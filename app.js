const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bodyParser = require('body-parser');
const cors = require('cors'); // Adicione isto para lidar com CORS

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Habilitar CORS
app.use(express.static(__dirname));

// Função para validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false; // Verifica se o CPF tem 11 dígitos e se não são todos iguais
    }

    let soma = 0;
    let resto;

    // Verifica o primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;

    // Verifica o segundo dígito verificador
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

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

    // Verificação de campos vazios
    if (!nome || !sobreNome || !email || !cpf) {
        return res.json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    // Validação de CPF
    if (!validarCPF(cpf)) {
        return res.json({ success: false, message: 'CPF inválido.' });
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
