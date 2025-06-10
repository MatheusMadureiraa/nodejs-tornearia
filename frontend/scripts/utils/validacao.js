// valida se os campos obrigatórios estão preenchidos
function validarCamposObrigatorios(campos) {
    let camposFaltando = [];

    for (const [campo, valor] of Object.entries(campos)) {
        if (!valor) camposFaltando.push(campo);
    }

    if (camposFaltando.length > 0) {
        alert(`Os seguintes campos são obrigatórios: ${camposFaltando.join(", ")}`);
        return false;
    }

    return true;
}

export { validarCamposObrigatorios };
