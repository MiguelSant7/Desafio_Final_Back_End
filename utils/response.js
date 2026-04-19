// Função utilitária pra formatar erros no JSON exigido pelo enunciado
function errorJson(message, status = 400) {
  return { error: message, statusCode: status };
}

module.exports = { errorJson };
