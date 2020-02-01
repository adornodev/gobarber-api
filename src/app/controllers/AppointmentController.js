import { format, isBefore, parseISO, startOfHour, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import * as Yup from 'yup';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';
import Appointment from '../models/Appointment';
import File from '../models/File';
import User from '../models/User';
import NotificationSchema from '../schemas/Notification';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointment.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      where: {
        user_id: req.userID,
        canceled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date', 'canceled_at'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Falha na validação dos dados fornecidos' });
    }

    const { provider_id, date } = req.body;

    /**
     * Check if provider_id is a provider
     */

    const isProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true,
      },
    });

    if (!isProvider) {
      return res.status(401).json({
        error: 'Você só pode criar agendamento sendo um provedor de serviço',
      });
    }

    if (provider_id === req.userID) {
      return res.status(401).json({
        error: 'Não é permitido realizar o próprio agendamento!',
      });
    }

    /**
     * Check past dates
     */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Data do passado não é permitida' });
    }

    /**
     * Check date availability
     */

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Data de agendamento não está disponível' });
    }
    const appointment = await Appointment.create({
      user_id: req.userID,
      provider_id,
      date: hourStart,
    });

    /**
     * Notify appointment provider
     */

    const user = await User.findByPk(req.userID);

    const formatedDate = format(hourStart, "'dia' dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });

    await NotificationSchema.create({
      content: `Novo agendamento de ${user.name} para ${formatedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        { model: User, as: 'user', attributes: ['name'] },
      ],
    });

    if (!appointment) {
      return res.status(401).json({
        error: 'Não há agendamento para ser deletado!',
      });
    }

    if (appointment.user_id !== req.userID) {
      return res.status(401).json({
        error: 'Você não tem permissão para cancelar este agendamento',
      });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'Só pode cancelar agendamento com 2 horas no mínimo!',
      });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
