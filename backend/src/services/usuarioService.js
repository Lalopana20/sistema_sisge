const bcrypt       = require('bcryptjs');
const db           = require('../config/db');
const UsuarioModel = require('../models/usuarioModel');

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const UsuarioService = {
  async listar(filtros) {
    return UsuarioModel.listar(filtros);
  },

  async listarOperarios() {
    return UsuarioModel.listar({ rol: 'operario' });
  },

  async obtener(id) {
    const u = await UsuarioModel.findById(id);
    if (!u) throw httpError(404, 'Usuario no encontrado');
    return u;
  },

  async crear({ nombre, username, email, password, rol }) {
    const usernameLower = username.toLowerCase();

    const existeNombre = await UsuarioModel.findByNombreRaw(nombre);
    if (existeNombre) throw httpError(409, 'El nombre ya está registrado');

    const existe = await UsuarioModel.findByUsernameRaw(usernameLower);
    if (existe) throw httpError(409, 'El nombre de usuario ya está en uso');

    if (email) {
      const existeEmail = await UsuarioModel.findByEmailRaw(email);
      if (existeEmail) throw httpError(409, 'El email ya está registrado');
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = await UsuarioModel.crear({
      nombre,
      username: usernameLower,
      email: email || null,
      password_hash,
      rol,
    });
    return UsuarioModel.findById(id);
  },

  async actualizar(id, datos, idSolicitante) {
    const usuario = await this.obtener(id);

    // ✅ CORRECCIÓN IMPORTANTE 4: Bloquear edición de usuarios eliminados
    // Nota: Se permite reactivar (cambiar activo de 0 a 1) pero no editar otros campos
    const usuarioRaw = await UsuarioModel.findByIdRaw(id);
    if (usuarioRaw && usuarioRaw.activo === 0 && !datos.activo) {
      throw httpError(400, 'No se puede editar un usuario eliminado. Reactívalo primero desde la papelera.');
    }

    if (datos.rol && usuario.rol === 'admin' && datos.rol !== 'admin') {
      // FOR UPDATE previene race condition: dos peticiones simultáneas no pueden
      // pasar ambas la validación y degradar al último admin al mismo tiempo
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        const [[{ total }]] = await conn.query(
          "SELECT COUNT(*) as total FROM usuarios WHERE rol = 'admin' AND COALESCE(activo, 1) = 1 FOR UPDATE",
        );
        if (total <= 1) {
          await conn.rollback();
          throw httpError(400, 'No puedes cambiar el rol del último administrador del sistema');
        }
        await conn.query(
          'UPDATE usuarios SET rol = ? WHERE id = ?',
          [datos.rol, id],
        );
        // Actualizar el resto de campos si los hay (sin rol, ya procesado)
        const { rol: _rol, password, ...restoSinRol } = datos;
        if (password) restoSinRol.password_hash = await bcrypt.hash(password, 10);
        if (Object.keys(restoSinRol).length) {
          // Usar conn (dentro de la transacción) en lugar del pool global
          const camposExtra = Object.keys(restoSinRol).map(k => `${k} = ?`).join(', ');
          const valsExtra   = [...Object.values(restoSinRol), id];
          await conn.query(`UPDATE usuarios SET ${camposExtra} WHERE id = ?`, valsExtra);
        }
        await conn.commit();
        return UsuarioModel.findById(id);
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }

    if (datos.nombre) {
      const otroNombre = await UsuarioModel.findByNombreRaw(datos.nombre);
      if (otroNombre && otroNombre.id !== parseInt(id)) {
        throw httpError(409, 'El nombre ya está en uso por otro usuario');
      }
    }

    if (datos.username) {
      datos.username = datos.username.toLowerCase();
      const otro = await UsuarioModel.findByUsernameRaw(datos.username);
      if (otro && otro.id !== parseInt(id)) {
        throw httpError(409, 'El nombre de usuario ya está en uso');
      }
    }

    if (datos.email) {
      const otro = await UsuarioModel.findByEmailRaw(datos.email);
      if (otro && otro.id !== parseInt(id)) {
        throw httpError(409, 'El email ya está en uso');
      }
    }

    if (datos.password) {
      datos.password_hash = await bcrypt.hash(datos.password, 10);
      delete datos.password;
    }

    await UsuarioModel.actualizar(id, datos);
    return UsuarioModel.findById(id);
  },

  async toggleEstado(id, activo) {
    const usuario = await UsuarioModel.findByIdRaw(id);
    if (!usuario) throw httpError(404, 'Usuario no encontrado');

    if (!activo && usuario.rol === 'admin') {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        const [[{ total }]] = await conn.query(
          "SELECT COUNT(*) as total FROM usuarios WHERE rol = 'admin' AND COALESCE(activo, 1) = 1 FOR UPDATE",
        );
        if (total <= 1) {
          await conn.rollback();
          throw httpError(400, 'No puedes desactivar al último administrador del sistema');
        }
        await conn.query(
          'UPDATE usuarios SET activo = 0 WHERE id = ?', [id],
        );
        await conn.commit();
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } else {
      await UsuarioModel.cambiarEstado(id, activo);
    }

    return UsuarioModel.findByIdRaw(id);
  },

  async eliminar(id, idSolicitante) {
    if (parseInt(id) === parseInt(idSolicitante)) {
      throw httpError(400, 'No puedes eliminar tu propia cuenta');
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const usuario = await this.obtener(id);

      if (usuario.rol === 'admin') {
        const [[{ total }]] = await conn.query(
          "SELECT COUNT(*) as total FROM usuarios WHERE rol = 'admin' AND COALESCE(activo, 1) = 1",
        );
        if (total <= 1) {
          throw httpError(400, 'No puedes eliminar al último administrador del sistema');
        }
      }

      const tieneMovs = await UsuarioModel.tieneMovimientos(id);
      if (tieneMovs) {
        throw httpError(409, 'No se puede eliminar: el usuario tiene movimientos registrados');
      }

      await UsuarioModel.eliminar(id);
      await conn.commit();
      return { mensaje: 'Usuario eliminado correctamente' };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = UsuarioService;
