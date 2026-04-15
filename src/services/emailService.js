// src/services/emailService.js
import BaseDatos from '../baseDatos.js';

const db = new BaseDatos();

export class EmailService {
    
    /**
     * Verifica si un email está disponible para registro
     * @param {string} email - Email a verificar
     * @returns {Object} - Resultado de la verificación
     */
    static verificarEmail(email) {
        try {
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return {
                    exists: false,
                    valid: false,
                    message: 'Formato de email inválido'
                };
            }

            // Verificar si ya existe en la base de datos
            const existe = db.verificarEmailExistente(email);
            
            return {
                exists: existe,
                valid: true,
                message: existe ? 'Email ya registrado' : 'Email disponible'
            };

        } catch (error) {
            console.error('Error verificando email:', error);
            return {
                exists: false,
                valid: false,
                message: 'Error verificando email'
            };
        }
    }
}