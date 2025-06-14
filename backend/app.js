const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = require('./config/corsOptions');
const path = require('path');

app.use(cors(corsOptions))
app.use(express.json());

// ROUTES
app.use('/', require('./routes/root'));
app.use('/servicos', require("./routes/api/servicosRoutes.js"));
app.use('/clientes', require('./routes/api/clientesRoutes'));
app.use('/pedidos', require("./routes/api/pedidosRoutes.js"));

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

module.exports = app;
