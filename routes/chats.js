const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Чаты
 *   description: Управление чатами
 */

// All routes require authentication
router.use(auth);

/**
 * @swagger
 * /chats:
 *   post:
 *     summary: Создать новый чат
 *     tags: [Чаты]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participants
 *             properties:
 *               isGroup:
 *                 type: boolean
 *                 description: Является ли чат групповым
 *               name:
 *                 type: string
 *                 description: Название группового чата
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Массив ID участников чата
 *     responses:
 *       201:
 *         description: Чат успешно создан
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Участник не найден
 *       500:
 *         description: Ошибка сервера
 */
router.post('/', chatController.createChat);

/**
 * @swagger
 * /chats:
 *   get:
 *     summary: Получить все чаты текущего пользователя
 *     tags: [Чаты]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список чатов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   isGroup:
 *                     type: boolean
 *                   name:
 *                     type: string
 *                   participants:
 *                     type: array
 *                     items:
 *                       type: object
 *                   creator:
 *                     type: string
 *                   lastMessage:
 *                     type: object
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Ошибка сервера
 */
router.get('/', chatController.getChats);

/**
 * @swagger
 * /chats/{chatId}:
 *   get:
 *     summary: Получить чат по ID
 *     tags: [Чаты]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID чата
 *     responses:
 *       200:
 *         description: Данные чата
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа к чату
 *       404:
 *         description: Чат не найден
 *       500:
 *         description: Ошибка сервера
 */
router.get('/:chatId', chatController.getChatById);

/**
 * @swagger
 * /chats/{chatId}:
 *   put:
 *     summary: Обновить настройки чата (для групповых чатов)
 *     tags: [Чаты]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID чата
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               custom:
 *                 type: object
 *                 properties:
 *                   themeColor:
 *                     type: string
 *                   icon:
 *                     type: string
 *     responses:
 *       200:
 *         description: Чат успешно обновлен
 *       400:
 *         description: Нельзя обновить личный чат
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав на обновление чата
 *       404:
 *         description: Чат не найден
 *       500:
 *         description: Ошибка сервера
 */
router.put('/:chatId', chatController.updateChat);

/**
 * @swagger
 * /chats/{chatId}/participants:
 *   post:
 *     summary: Добавить участников в групповой чат
 *     tags: [Чаты]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID чата
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participants
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Массив ID новых участников
 *     responses:
 *       200:
 *         description: Участники успешно добавлены
 *       400:
 *         description: Ошибка валидации или нельзя добавить участников в личный чат
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Только создатель чата может добавлять участников
 *       404:
 *         description: Чат не найден
 *       500:
 *         description: Ошибка сервера
 */
router.post('/:chatId/participants', chatController.addParticipants);

/**
 * @swagger
 * /chats/{chatId}/participants/{participantId}:
 *   delete:
 *     summary: Удалить участника из группового чата
 *     tags: [Чаты]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID чата
 *       - in: path
 *         name: participantId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID участника для удаления
 *     responses:
 *       200:
 *         description: Участник успешно удален
 *       400:
 *         description: Нельзя удалить участника из личного чата
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав на удаление участника
 *       404:
 *         description: Чат или участник не найден
 *       500:
 *         description: Ошибка сервера
 */
router.delete('/:chatId/participants/:participantId', chatController.removeParticipant);

/**
 * @swagger
 * /chats/{chatId}/messages:
 *   post:
 *     summary: Отправить сообщение в чат
 *     tags: [Сообщения]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID чата
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Текст сообщения
 *     responses:
 *       201:
 *         description: Сообщение успешно отправлено
 *       400:
 *         description: Отсутствует текст сообщения
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав на отправку сообщений в этот чат
 *       404:
 *         description: Чат не найден
 *       500:
 *         description: Ошибка сервера
 */
router.post('/:chatId/messages', messageController.sendMessage);

/**
 * @swagger
 * /chats/{chatId}/messages:
 *   get:
 *     summary: Получить сообщения чата
 *     tags: [Сообщения]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID чата
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество сообщений (по умолчанию 50)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы (по умолчанию 1)
 *     responses:
 *       200:
 *         description: Список сообщений
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   chatId:
 *                     type: string
 *                   sender:
 *                     type: object
 *                   text:
 *                     type: string
 *                   readBy:
 *                     type: array
 *                     items:
 *                       type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав на просмотр сообщений в этом чате
 *       404:
 *         description: Чат не найден
 *       500:
 *         description: Ошибка сервера
 */
router.get('/:chatId/messages', messageController.getMessages);

module.exports = router; 