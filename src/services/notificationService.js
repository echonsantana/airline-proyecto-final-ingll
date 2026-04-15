// src/services/notificationService.js
export class NotificationService {
  static estadosVuelo = {
    PROGRAMADO: 'programado',
    EMBARCANDO: 'embarcando',
    CERRADO: 'cerrado',
    EN_PISTA: 'en_pista',
    DESPEGADO: 'despegado',
    ATERRIZADO: 'aterrizado'
  };

  static generarAlertas(vuelo) {
    const ahora = new Date();
    const horaSalida = new Date(vuelo.fecha + 'T' + vuelo.horaSalida);
    const diffMinutos = (horaSalida - ahora) / (1000 * 60);

    const alertas = [];

    if (diffMinutos <= 45 && diffMinutos > 30) {
      alertas.push({
        tipo: 'embarque',
        mensaje: `¡Embarque próximo! El vuelo ${vuelo.numero} comenzará a embarcar en 30 minutos.`,
        importancia: 'media'
      });
    }

    if (diffMinutos <= 30 && diffMinutos > 15) {
      alertas.push({
        tipo: 'embarque',
        mensaje: `¡Embarque iniciado! Acércate a la puerta ${vuelo.puerta} para el vuelo ${vuelo.numero}.`,
        importancia: 'alta'
      });
    }

    if (diffMinutos <= 0) {
      alertas.push({
        tipo: 'cerrado',
        mensaje: `Embarque cerrado para el vuelo ${vuelo.numero}.`,
        importancia: 'alta'
      });
    }

    return alertas;
  }

  static enviarNotificacionPush(mensaje, tipo = 'info') {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Aerolínea Premium', {
        body: mensaje,
        icon: '/src/img/logo.png',
        tag: 'vuelo'
      });
    }
    
    // También mostrar toast
    if (typeof showToast === 'function') {
      showToast(mensaje, tipo);
    }
  }

  static solicitarPermisos() {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }
}