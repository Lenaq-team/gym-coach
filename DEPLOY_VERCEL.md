# Desplegar en Vercel 🚀

## Pasos para desplegar:

### 1. Preparar el repositorio

Tu código ya está en GitHub:
```
https://github.com/Lenaq-team/gym-coach
```

### 2. Ir a Vercel

1. Ve a: https://vercel.com
2. Haz login con tu cuenta de GitHub
3. Click en "Add New..." → "Project"

### 3. Importar el proyecto

1. Busca el repositorio: `Lenaq-team/gym-coach`
2. Click en "Import"

### 4. Configurar el proyecto

**Framework Preset:** Vite
**Root Directory:** `./` (leave as is)
**Build Command:** `npm run build`
**Output Directory:** `dist`

### 5. Agregar Variables de Entorno

Click en "Environment Variables" y agrega:

```
VITE_SUPABASE_URL=https://syjuegeiwvvbcsomsaxs.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Mo1WaS_I59DmhoI2-zXXDg_aPebTZyN
```

⚠️ **Importante:** Estas son las mismas variables que están en tu `.env.local`

### 6. Deploy!

1. Click en "Deploy"
2. Espera 1-2 minutos
3. ¡Listo! Vercel te dará una URL como: `https://gym-coach-xxx.vercel.app`

---

## Configuración automática de Vercel

Vercel ya detectará automáticamente:
- ✅ Vite como framework
- ✅ Node.js como runtime
- ✅ El comando de build
- ✅ La carpeta de output

---

## Después del despliegue

### Probar la app:
1. Abre la URL que te dio Vercel
2. Inicia sesión con:
   - Coach: `coach@test.com` / `password123`
   - Cliente: `client@test.com` / `password123`

### Configurar dominio personalizado (opcional):
1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Agrega tu dominio personalizado

---

## Auto-deploy en cada push

Vercel automáticamente desplegará cada vez que hagas `git push` a la rama `main`.

**Workflow:**
```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel despliega automáticamente ✨
```

---

## Troubleshooting

### Si falla el build:
1. Verifica que las variables de entorno estén correctas
2. Revisa los logs en Vercel Dashboard

### Si no carga la app:
1. Abre DevTools (F12) → Console
2. Verifica que las variables VITE estén disponibles
3. Comprueba que Supabase esté accesible

---

## ✅ Checklist antes de desplegar:

- ✅ Código en GitHub
- ✅ Variables de entorno preparadas
- ✅ Build local funciona (`npm run build`)
- ✅ Base de datos Supabase configurada
- ✅ Usuarios de prueba creados

**¡Ya estás listo para desplegar!** 🎉
