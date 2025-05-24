const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Аутентификация]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *               username:
 *                 type: string
 *                 description: Имя пользователя
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Пароль пользователя
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     status:
 *                       type: string
 *                     custom:
 *                       type: object
 *                 token:
 *                   type: string
 *       400:
 *         description: Ошибка валидации или пользователь уже существует
 *       500:
 *         description: Ошибка сервера
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Вход пользователя
 *     tags: [Аутентификация]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Пароль пользователя
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     status:
 *                       type: string
 *                     custom:
 *                       type: object
 *                 token:
 *                   type: string
 *       400:
 *         description: Неверные учетные данные
 *       500:
 *         description: Ошибка сервера
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Аутентификация]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 username:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 status:
 *                   type: string
 *                 custom:
 *                   type: object
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */
router.get('/me', auth, authController.getCurrentUser);

module.exports = router; 