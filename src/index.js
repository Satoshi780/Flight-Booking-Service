const express=require('express');
const amqplib=require('amqplib');
const {EmailService}=require('./services');
async function connectQueue() {
    try {
        const connection = await amqplib.connect("amqp://localhost:5672");
        const channel = await connection.createChannel();
        await channel.assertQueue("noti-queue");
        channel.consume("noti-queue", async (data) => {
            console.log(`${Buffer.from(data.content)}`);
            const object = JSON.parse(`${Buffer.from(data.content)}`);
            await EmailService.sendEmail("airlinenoti@gmail.com", object.recepientEmail, object.subject, object.text);
            channel.ack(data);
        });
    } catch(error) {
    }
    
}
const {ServerConfig ,Logger,Queue}=require('./config');
const apiRoutes=require('./routes');
const { CRONS }=require('./utils/common');
const app=express();


app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use('/api',apiRoutes);
app.use('/bookingService/api',apiRoutes);
app.listen(ServerConfig.PORT,async () => {
    Logger.info(`Successfully started the server on PORT: ${ServerConfig.PORT}`);
    CRONS();
    await Queue.connectQueue();
    console.log('Connected to RabbitMQ');
})