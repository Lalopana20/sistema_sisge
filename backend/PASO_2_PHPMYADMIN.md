# 🔐 PASO 2: ESTABLECER CONTRASEÑA MYSQL (phpMyAdmin)

**Fecha**: 3 de junio de 2026  
**Tiempo estimado**: 10 minutos  
**Método**: Opción A - phpMyAdmin (Visual)

---

## ✅ **PASO 1 COMPLETADO**

✅ JWT_SECRET ya fue actualizado automáticamente  
✅ Nuevo secreto: `1fa6934f4c4e680bfd450a7838b77f38cbe029b6c24615e73c4d2c3307cc47d35ba0fd9b119ae2eff21d9058f02a09a64bb52b8b34d7fa4e965c3fb36d3375bb`

---

## 🎯 **AHORA TE TOCA A TI**

### **IMPORTANTE**: Este paso DEBES hacerlo **TÚ MANUALMENTE** porque requiere:
- Acceso a tu navegador web
- Interactuar con la interfaz visual de phpMyAdmin
- Establecer la contraseña que solo tú debes conocer

---

## 📋 **INSTRUCCIONES PASO A PASO**

### **1️⃣ Abrir phpMyAdmin**

```
http://localhost/phpmyadmin
```

**Copia y pega esta URL en tu navegador (Chrome, Firefox, Edge)**

**¿Qué verás?**
- Una página con menú lateral izquierdo
- Logo de phpMyAdmin arriba
- Opción "Nuevo" en el menú

**Si NO se abre**:
```
1. Abre XAMPP Control Panel
2. Verifica que "Apache" esté en verde con "Running"
3. Verifica que "MySQL" esté en verde con "Running"
4. Si no, haz clic en "Start" para cada uno
5. Espera 10 segundos
6. Intenta de nuevo: http://localhost/phpmyadmin
```

---

### **2️⃣ Ir a "Cuentas de Usuario"**

**Ubicación**: En la **barra superior** de phpMyAdmin

Busca una de estas opciones (depende del idioma):
- **"Cuentas de usuario"** (español)
- **"User accounts"** (inglés)
- **"Users"** (inglés corto)

**Haz clic ahí**

**¿Qué verás?**
Una tabla con columnas:
- Usuario
- Nombre del host  
- Contraseña
- Privilegios globales
- Acción

---

### **3️⃣ Buscar el Usuario "root"**

En la tabla, busca la fila que tenga:

```
Usuario: root
Nombre del host: localhost
```

**IMPORTANTE**: Puede haber varios usuarios "root". **Necesitas el que tenga host "localhost"**

---

### **4️⃣ Editar Privilegios**

En la misma fila del usuario `root` con host `localhost`:

**Columna "Acción"**: Verás iconos

Haz clic en el icono de **"Editar privilegios"**
- Puede ser un lápiz 🖊️
- Puede ser un engranaje ⚙️
- Puede decir "Edit privileges"

---

### **5️⃣ Cambiar Contraseña**

Ahora verás una página con varias pestañas en la parte superior:

Haz clic en la pestaña **"Cambiar contraseña"**
- En español: "Cambiar contraseña"
- En inglés: "Change password"

---

### **6️⃣ Establecer Nueva Contraseña**

Verás un formulario. Completa:

```
Contraseña:       SisgeDB2024!@#
Re-escribir:      SisgeDB2024!@#
```

**IMPORTANTE**: 
- ✅ Copia exactamente: `SisgeDB2024!@#`
- ✅ Incluye los símbolos: `!@#`
- ✅ Respeta mayúsculas y minúsculas: `SisgeDB` (no `sisgedb`)

**Deja los otros campos como están** (no cambies nada más)

---

### **7️⃣ Guardar**

**Botón en la parte inferior derecha**:
- Puede decir "Continuar" o "Go" o "Aceptar"

**Haz clic en ese botón**

---

### **8️⃣ Confirmar Éxito**

**¿Qué verás?**

✅ **Mensaje de éxito** (uno de estos):
- "La contraseña ha sido cambiada"
- "Password has been changed"
- "Usuario actualizado"

❌ **Si ves error**:
- Verifica que copiaste bien la contraseña
- Intenta de nuevo desde el Paso 4

---

### **9️⃣ IMPORTANTE - No Cierres Todavía**

**Después de cambiar la contraseña**:

phpMyAdmin puede **dejar de funcionar** temporalmente porque ahora MySQL requiere contraseña.

**Esto es NORMAL y ESPERADO** ✅

**NO TE PREOCUPES** - Lo vamos a arreglar ahora mismo.

---

## 🎬 **CUANDO TERMINES**

**Escribe exactamente esto en el chat**:

```
Listo, cambié la contraseña en phpMyAdmin
```

**Entonces YO voy a**:
1. ✅ Actualizar el archivo `.env` con la nueva contraseña
2. ✅ Actualizar la configuración de phpMyAdmin
3. ✅ Ejecutar el Paso 3 (actualizar dependencias)
4. ✅ Crear script de verificación

---

## ❓ **¿PROBLEMAS?**

### **Problema 1: No puedo acceder a phpMyAdmin**
```
Solución:
1. XAMPP Control Panel
2. Clic en "Stop" en MySQL
3. Esperar 5 segundos
4. Clic en "Start" en MySQL
5. Esperar 10 segundos
6. Intentar: http://localhost/phpmyadmin
```

### **Problema 2: No veo "Cuentas de usuario"**
```
Puede estar como:
- Pestaña arriba que dice "Users"
- O "User accounts" 
- O icono de usuario 👤

Si no lo encuentras, escríbeme y te guío.
```

### **Problema 3: Hay varios usuarios "root"**
```
Debes editar el que tiene:
Host: localhost  (no %, ni 127.0.0.1)

Si no estás seguro, escríbeme.
```

### **Problema 4: No encuentro "Cambiar contraseña"**
```
Después de editar privilegios:
- Mira en las pestañas superiores
- Puede decir "Change password"
- O puede estar como botón "Password"

Si no lo encuentras, escríbeme.
```

---

## 🎯 **RESUMEN**

**Qué vas a hacer**:
1. ✅ Abrir http://localhost/phpmyadmin
2. ✅ Ir a "Cuentas de usuario"
3. ✅ Editar usuario "root" (localhost)
4. ✅ Cambiar contraseña a: `SisgeDB2024!@#`
5. ✅ Guardar
6. ✅ Escribir en el chat: "Listo, cambié la contraseña en phpMyAdmin"

**Tiempo estimado**: 10 minutos

---

## ⚠️ **IMPORTANTE**

- ❌ NO reinicies MySQL todavía
- ❌ NO cierres phpMyAdmin todavía
- ❌ NO edites archivos manualmente
- ✅ Solo sigue los pasos de arriba
- ✅ Avísame cuando termines

---

**¿Listo para empezar?** 🚀

Abre tu navegador y ve a: http://localhost/phpmyadmin
