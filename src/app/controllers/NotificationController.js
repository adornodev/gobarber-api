import User from '../models/User';
import NotificationSchema from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    const checkIsProvider = await User.findOne({
      where: {
        id: req.userID,
        provider: true,
      },
    });

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'Somente provedores podem carregar as notificações' });
    }

    const notifications = await NotificationSchema.find({
      user: req.userID,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    // o new: true informa que depois de atualizar, ele retorna e não retorna antes de atualizar.
    const notification = await NotificationSchema.findByIdAndUpdate(
      req.params.id,
      {
        read: true,
      },
      { new: true }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
