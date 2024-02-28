import express from 'express';
import { connect } from 'amqplib';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();



const app = express();
const port = process.env.PORT;

const url : string = process.env.AMQP_URL!;
const queue : string = process.env.AMQP_QUEUE!;
const urlApi : string = process.env.API2_URL!;

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);

  const connection = await connect(url);
  const channel = await connection.createChannel();
  await channel.assertQueue(queue);
  channel.consume(queue, async (message) => {
    if (message) {
      const data = JSON.parse(message.content.toString());
      console.log(`Im reading this from RabbitMQ:`);
      console.log(data);
      try {
        const response = await axios.post(`${urlApi}/api/post/`, {
          title: data.title,
          content: data.content,
          authorId: data.authorId,
        
        });
      } catch (error) {
        console.error(error);
      }
      channel.ack(message);
    }
  });
});