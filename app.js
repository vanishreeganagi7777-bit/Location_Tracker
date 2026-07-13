const express=require('express');
const app=express();
const http=require('http');
const socketio=require('socket.io');
const path=require('path');
const _dirname=path.resolve();
const server=http.createServer(app);
const io=socketio(server);

app.use(express.static("public"));

app.set("view engine", "ejs");


io.on("connection", function(socket){
    socket.on("send-location", function(data){
        io.emit("receive-location", {id:socket.id, ...data});
    });
    socket.on("disconnect", function(){
        io.emit("user-disconnected", socket.id);
    })
});



app.get("/", function(req, res){
    res.render("index");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});