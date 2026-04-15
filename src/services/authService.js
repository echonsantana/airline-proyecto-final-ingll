// src/services/authService.js
import { supabase } from './supabaseClient.js';
import { EmailNotificationService } from './emailNotificationService.js';

export class AuthService {
    
    static encriptarPassword(password) {
        return btoa(unescape(encodeURIComponent(password)));
    }

    static verificarPassword(password, hash) {
        const passwordEncriptado = btoa(unescape(encodeURIComponent(password)));
        return passwordEncriptado === hash;
    }

    static async registrarUsuario(usuarioData) {
        try {
            const { data: existingUser } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', usuarioData.email.toLowerCase().trim())
                .maybeSingle();

            if (existingUser) {
                return {
                    success: false,
                    message: 'El email ya está registrado'
                };
            }

            if (!usuarioData.password || usuarioData.password.length < 6) {
                return {
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                };
            }

            const passwordEncriptada = this.encriptarPassword(usuarioData.password);

            const nuevoUsuario = {
                email: usuarioData.email.toLowerCase().trim(),
                password: passwordEncriptada,
                nombre: usuarioData.nombre,
                rol: 'cliente',
                isverified: false
            };

            const { data, error } = await supabase
                .from('usuarios')
                .insert([nuevoUsuario])
                .select();

            if (error) {
                console.error('Error guardando usuario:', error);
                return {
                    success: false,
                    message: 'Error guardando usuario'
                };
            }

            EmailNotificationService.enviarEmailConfirmacion(nuevoUsuario.email, nuevoUsuario.nombre)
                .then(resultado => {
                    if (resultado.success) {
                        console.log('📧 Email de confirmación enviado exitosamente');
                    }
                })
                .catch(error => {
                    console.error('❌ Error enviando email de confirmación:', error);
                });

            return {
                success: true,
                message: 'Usuario registrado exitosamente. Se ha enviado un email de confirmación.',
                user: { ...nuevoUsuario, password: undefined }
            };

        } catch (error) {
            console.error('Error registrando usuario:', error);
            return {
                success: false,
                message: 'Error al registrar usuario'
            };
        }
    }

    static async loginUsuario(email, password) {
        try {
            console.log('🔐 LOGIN UNIVERSAL:', { email });

            const { data: usuario, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', email.toLowerCase().trim())
                .single();

            if (error) {
                console.error('Error consultando usuario:', error);
                return { success: false, message: 'Error consultando usuario' };
            }

            if (!usuario) {
                return { success: false, message: 'Email no registrado' };
            }

            const passwordValida = this.verificarPassword(password, usuario.password);

            if (!passwordValida) {
                return { success: false, message: 'Contraseña incorrecta' };
            }

            return {
                success: true,
                message: 'Login exitoso',
                user: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol,
                    puntos: usuario.puntos || 0
                }
            };

        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, message: 'Error en el servidor' };
        }
    }
}

// Exportar las funciones individualmente
export const loginUsuario = AuthService.loginUsuario.bind(AuthService);
export const registrarUsuario = AuthService.registrarUsuario.bind(AuthService);