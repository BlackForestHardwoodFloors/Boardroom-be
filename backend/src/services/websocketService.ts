import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initializeWebSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const broadcastMessage = (message: any) => {
    if (io) {
        io.emit('newMessage', {
            ...message,
        });
    }
};