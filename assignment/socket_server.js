const io = require( "socket.io" )();

const socketapi = {
    io: io
};
 

io.on("connection", (client) =>{
    console.log("Client connected : " + client.id);
    // định nghĩa 1 sự kiện

    client.on('login', (msg)=>{
        // nhận dữ liệu từ client gửi lên
        console.log("login: " + msg );
        // gửi phản hồi
        client.emit('login', msg );
    });
    
    client.on('binhluan', (room)=>{
        // nhận dữ liệu từ client gửi lên
        console.log("Join room: " + room );

        // console.log(room.toString());
        client.join(room.toString());
        // client.emit('binhluan', "Đã vào phòng");
        // client.emit('binhluan', client.rooms.has(room)?"Yes":"No" );
        // client.to(room).emit('binhluan', "Ai đó vào phòng thành công" );
    });
      

    // sự kiện ngắt kết nối
    client.on('disconnect', ()=>{
        console.log("Client disconected!");
    })  
});
    

module.exports = socketapi;