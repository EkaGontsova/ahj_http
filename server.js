/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as crypto from 'crypto';
import pino from 'pino';
import pinoPretty from 'pino-pretty';

const app = express();
const logger = pino(pinoPretty());

app.use(cors());
app.use(
  bodyParser.json({
    // eslint-disable-next-line no-unused-vars
    type(req) {
      return true;
    },
  }),
);
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

let tickets = [
  {
    id: crypto.randomUUID(),
    name: 'Поменять краску в принтере, ком. 404',
    description: 'Принтер HP LJ-1210, картриджи на складе',
    status: false,
    created: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Переустановить Windows, PC-Hall24',
    description: '',
    status: false,
    created: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Установить обновление KB-31642dv3875',
    description: 'Вышло критическое обновление для Windows',
    status: false,
    created: Date.now(),
  },
];

app.use(async (request, response) => {
  const { method, id } = request.query;
  switch (method) {
    case 'allTickets':
      logger.info('All tickets has been called');
      response.send(JSON.stringify(tickets)).end();
      break;
    case 'ticketById': {
      const foundTicket = tickets.find((ticket) => ticket.id === id);
      if (!foundTicket) {
        response
          .status(404)
          .send(JSON.stringify({ message: 'Ticket not found' }))
          .end();
        break;
      }
      response.send(JSON.stringify(foundTicket)).end();
      break;
    }
    case 'createTicket': {
      try {
        const createData = request.body;
        const newTicket = {
          id: crypto.randomUUID(),
          name: createData.name,
          status: false,
          description: createData.description || '',
          created: Date.now(),
        };
        tickets.push(newTicket);
        logger.info(`New ticket created: ${JSON.stringify(newTicket)}`);
        response.send(JSON.stringify(newTicket)).end();
      } catch (error) {
        logger.error(`Error creating new ticket: ${error.message}`);
        response.status(500).send(JSON.stringify({ error: error.message }));
      }
      break;
    }
    case 'deleteById': {
      const foundTicket = tickets.find((ticket) => ticket.id === id);
      if (foundTicket) {
        tickets = tickets.filter((ticket) => ticket.id !== id);
        logger.info(`Ticket deleted: ${JSON.stringify(foundTicket)}`);
        response.status(204).end();
      } else {
        logger.warn(`Ticket not found: ${id}`);
        response
          .status(404)
          .send(JSON.stringify({ message: 'Ticket not found' }))
          .end();
      }
      break;
    }
    case 'updateById': {
      const foundTicket = tickets.find((ticket) => ticket.id === id);
      const updateData = request.body;
      if (foundTicket) {
        Object.assign(foundTicket, updateData);
        logger.info(`Ticket updated: ${JSON.stringify(foundTicket)}`);
        response.send(JSON.stringify(tickets));
      } else {
        logger.warn(`Ticket not found: ${id}`);
        response
          .status(404)
          .send(JSON.stringify({ message: 'Ticket not found' }))
          .end();
      }
      break;
    }
    default:
      logger.warn(`Unknown method: ${method}`);
      response.status(404).end();
      break;
  }
});

const port = process.env.PORT || 7070;

const bootstrap = async () => {
  try {
    app.listen(port, () => logger.info(`Server has been started on http://localhost:${port}`));
  } catch (error) {
    console.error(error);
  }
};

bootstrap();
