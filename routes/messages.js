const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Сообщения
 *   description: Управление сообщениями
 */

// All routes require authentication
router.use(auth);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Отправить сообщение
 *     tags: [Сообщения]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - text
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: ID чата
 *               text:
 *                 type: string
 *                 description: Текст сообщения
 *     responses:
 *       201:
 *         description: Сообщение успешно отправлено
 *       400:
 *         description: Отсутствует ID чата или текст сообщения
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав на отправку сообщений в этот чат
 *       404:
 *         description: Чат не найден
 *       500:
 *         description: Ошибка сервера
 */
router.post('/', messageController.sendMessage);

/**
 * @swagger
 * /messages/{messageId}/read:
 *   put:
 *     summary: Отметить сообщение как прочитанное
 *     tags: [Сообщения]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID сообщения
 *     responses:
 *       200:
 *         description: Сообщение отмечено как прочитанное
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав на доступ к этому сообщению
 *       404:
 *         description: Сообщение не найдено
 *       500:
 *         description: Ошибка сервера
 */
router.put('/:messageId/read', messageController.markAsRead);

/**
 * @swagger
 * /messages/{messageId}:
 *   delete:
 *     summary: Удалить сообщение
 *     tags: [Сообщения]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID сообщения
 *     responses:
 *       200:
 *         description: Сообщение успешно удалено
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Можно удалять только свои сообщения
 *       404:
 *         description: Сообщение не найдено
 *       500:
 *         description: Ошибка сервера
 */
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router; 