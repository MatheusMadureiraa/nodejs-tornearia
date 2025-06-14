const app = require('./app.js');

const PORT = process.env.PORT || 3500

app.listen(PORT, () => {
    console.log(`Servidor rodando no endereço http://localhost:${PORT}`)
})
