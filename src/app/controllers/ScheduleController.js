import { endOfDay, parseISO, startOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Appointments from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: {
        id: req.userID,
        provider: true,
      },
    });

    if (!checkUserProvider) {
      return res
        .status(401)
        .json({ error: 'O usuário não é um provedor de serviço!' });
    }

    const { date } = req.query;
    const parsedDate = parseISO(date);

    const appointments = await Appointments.findAll({
      where: {
        provider_id: req.userID,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
        order: ['date'],
      },
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
