const express = require("express");
const router = express.Router();
const servicosController = require('../../controllers/servicosController');

router.route('/')
    .get(servicosController.getAllServices)
    .post(servicosController.createNewService);

router.route('/:idServico')
    .get(servicosController.getServiceById)
    .put(servicosController.updateService)
    .patch(servicosController.patchService)
    .delete(servicosController.deleteService);

module.exports = router;