const express = require('express');
const router = express.Router();
const pedidosController = require('../../controllers/pedidosController');

router.route('/')
    .get(pedidosController.getAllOrders)
    .post(pedidosController.createNewOrder);

router.route('/:idPedido')
    .get(pedidosController.getOrderById)
    .patch(pedidosController.patchOrder)
    .delete(pedidosController.deleteOrder);

module.exports = router;