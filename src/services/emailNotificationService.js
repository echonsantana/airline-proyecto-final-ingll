// src/services/emailNotificationService.js
export class EmailNotificationService {
    
    /**
     * Simula el envío de un correo de confirmación de registro
     * @param {string} email - Email del destinatario
     * @param {string} nombre - Nombre del usuario
     * @returns {Object} - Resultado del envío
     */
    static async enviarEmailConfirmacion(email, nombre) {
        try {
            console.log(`📧 Enviando email de confirmación a: ${email}`);
            
            // Simular delay de envío
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // En un entorno real, aquí iría la integración con:
            // - SendGrid, Mailgun, AWS SES, etc.
            // - O un servicio SMTP propio
            
            const emailData = {
                to: email,
                subject: '¡Bienvenido a AeroPremium - Confirma tu registro!',
                body: this._generarTemplateConfirmacion(nombre),
                sentAt: new Date().toISOString(),
                status: 'sent'
            };
            
            console.log('✅ Email de confirmación enviado:', emailData);
            
            return {
                success: true,
                message: 'Email de confirmación enviado exitosamente',
                data: emailData
            };
            
        } catch (error) {
            console.error('❌ Error enviando email:', error);
            return {
                success: false,
                message: 'Error al enviar email de confirmación'
            };
        }
    }
    
    /**
     * Simula el envío de un correo de reserva confirmada
     * @param {string} email - Email del destinatario
     * @param {Object} reserva - Datos de la reserva
     * @param {Object} vuelo - Datos del vuelo
     * @returns {Object} - Resultado del envío
     */
    static async enviarEmailReserva(email, reserva, vuelo) {
        try {
            console.log(`📧 Enviando email de reserva a: ${email}`);
            
            // Simular delay de envío
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const emailData = {
                to: email,
                subject: `✅ Reserva Confirmada - ${reserva.codigo}`,
                body: this._generarTemplateReserva(reserva, vuelo),
                sentAt: new Date().toISOString(),
                status: 'sent'
            };
            
            console.log('✅ Email de reserva enviado:', emailData);
            
            return {
                success: true,
                message: 'Email de reserva enviado exitosamente',
                data: emailData
            };
            
        } catch (error) {
            console.error('❌ Error enviando email de reserva:', error);
            return {
                success: false,
                message: 'Error al enviar email de reserva'
            };
        }
    }
    
    /**
     * Genera el template HTML para el email de confirmación
     * @param {string} nombre - Nombre del usuario
     * @returns {string} - Template HTML
     */
    static _generarTemplateConfirmacion(nombre) {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(90deg, #0a143c, #003278); color: white; padding: 20px; text-align: center;">
                <h1>✈️ AeroPremium</h1>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa;">
                <h2>¡Bienvenido a bordo, ${nombre}!</h2>
                <p>Tu registro en AeroPremium ha sido exitoso.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>🎉 Cuenta Creada Exitosamente</h3>
                    <p>Ya puedes comenzar a explorar y reservar tus próximos vuelos.</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Comenzar a Reservar
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    Si no realizaste este registro, por favor ignora este mensaje.
                </p>
            </div>
            
            <div style="background: #343a40; color: white; padding: 15px; text-align: center; font-size: 12px;">
                <p>&copy; 2025 AeroPremium. Todos los derechos reservados.</p>
            </div>
        </div>
        `;
    }

    // En emailNotificationService.js - AGREGAR ESTA FUNCIÓN
static mostrarEmailEnModal(emailData) {
    // Crear modal para mostrar el email
    const modalHTML = `
    <div class="modal fade" id="modalVerEmail" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">📧 Email Enviado</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <strong>Para:</strong> ${emailData.to}
                    </div>
                    <div class="mb-3">
                        <strong>Asunto:</strong> ${emailData.subject}
                    </div>
                    <div class="mb-3">
                        <strong>Enviado:</strong> ${new Date(emailData.sentAt).toLocaleString()}
                    </div>
                    <hr>
                    <div class="email-preview border p-3 bg-light" style="max-height: 400px; overflow-y: auto;">
                        ${emailData.body}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Agregar el modal al DOM si no existe
    if (!document.getElementById('modalVerEmail')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('modalVerEmail'));
    modal.show();
}
    
    /**
     * Genera el template HTML para el email de reserva
     * @param {Object} reserva - Datos de la reserva
     * @param {Object} vuelo - Datos del vuelo
     * @returns {string} - Template HTML
     */
    static _generarTemplateReserva(reserva, vuelo) {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(90deg, #0a143c, #003278); color: white; padding: 20px; text-align: center;">
                <h1>✈️ AeroPremium</h1>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa;">
                <h2>✅ Reserva Confirmada</h2>
                <p>Tu vuelo ha sido reservado exitosamente.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>📋 Detalles de la Reserva</h3>
                    <p><strong>Código:</strong> ${reserva.codigo}</p>
                    <p><strong>Vuelo:</strong> ${vuelo.origen} → ${vuelo.destino}</p>
                    <p><strong>Fecha:</strong> ${new Date(reserva.fecha).toLocaleDateString()}</p>
                    <p><strong>Asientos:</strong> ${reserva.asientos.join(', ')}</p>
                    <p><strong>Estado:</strong> <span style="color: #28a745;">${reserva.estado}</span></p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Ver Mis Reservas
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    Presenta este código en el mostrador de facturación.
                </p>
            </div>
            
            <div style="background: #343a40; color: white; padding: 15px; text-align: center; font-size: 12px;">
                <p>&copy; 2025 AeroPremium. Todos los derechos reservados.</p>
            </div>
        </div>
        `;
    }
}