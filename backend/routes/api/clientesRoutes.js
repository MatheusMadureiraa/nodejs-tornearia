const express = require('express');
const router = express.Router();
const clientesController = require('../../controllers/clientesController.js');

router.route('/')
    .get(clientesController.getAllClients)
    .post(clientesController.createNewClient);

router.route('/:idCliente')
    .get(clientesController.getClienteById)
    .put(clientesController.updateClient)
    .delete(clientesController.deleteClient);
    
module.exports = router;
