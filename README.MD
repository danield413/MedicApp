# MedicApp

Una ayuda para tus procesos médicos de forma rápida y efectiva.

## 🏗️ Arquitectura del Proyecto

Este proyecto está dividido en dos partes principales:

- **Backend** (`back-medicapp/`): API REST con Node.js y Express
- **Frontend** (`front-medicapp/`): Aplicación web con Next.js y React

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con **Express.js** - Framework del servidor
- **MongoDB** con **Mongoose** - Base de datos NoSQL
- **bcryptjs** - Encriptación de contraseñas
- **dotenv** - Gestión de variables de entorno

### Frontend
- **Next.js 15** - Framework de React con SSR/SSG
- **React 19** - Librería/Framework de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Framework de CSS

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [MongoDB](https://www.mongodb.com/) (local o remoto)
- [Git](https://git-scm.com/)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/danield413/MedicApp.git
cd MedicApp
```

### 2. Configurar el Backend

```bash
cd back-medicapp
npm install
```

Crear un archivo `.env` en el directorio `back-medicapp/` con las siguientes variables:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/medicapp
JWT_SECRET=tu_jwt_secret_aqui
```

### 3. Configurar el Frontend

```bash
cd ../front-medicapp
npm install
```

## 🏃‍♂️ Ejecutar la Aplicación

### Desarrollo

#### Backend
```bash
cd back-medicapp
npm start
# El servidor estará disponible en http://localhost:3001
```

#### Frontend
```bash
cd front-medicapp
npm run dev
# La aplicación estará disponible en http://localhost:3000
```

### Producción

#### Backend
```bash
cd back-medicapp
npm start
```

#### Frontend
```bash
cd front-medicapp
npm run build
npm start
```

## Scripts Disponibles

### Backend
- `npm start` - Inicia el servidor de desarrollo

### Frontend
- `npm run dev` - Inicia el servidor de desarrollo con Turbopack
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción


## 👥 Autores

- **Los Mejores** 
