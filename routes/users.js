const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Пользователи
 *   description: Управление пользователями
 */

// All routes require authentication
router.use(auth);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Получить профиль текущего пользователя
 *     tags: [Пользователи]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Профиль пользователя
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
router.get('/me', userController.getUserProfile);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Обновить профиль текущего пользователя
 *     tags: [Пользователи]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               avatar:
 *                 type: string
 *               custom:
 *                 type: object
 *                 properties:
 *                   backgroundColor:
 *                     type: string
 *                   bio:
 *                     type: string
 *     responses:
 *       200:
 *         description: Профиль успешно обновлен
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
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */
router.put('/me', userController.updateUserProfile);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Поиск пользователей
 *     tags: [Пользователи]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         required: true
 *         description: Поисковый запрос (имя пользователя или email)
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   email:
 *                     type: string
 *                   username:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   status:
 *                     type: string
 *       400:
 *         description: Отсутствует поисковый запрос
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Ошибка сервера
 */
router.get('/search', userController.searchUsers);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Пользователи]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
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
router.get('/:userId', userController.getUserById);

module.exports = router; 