const mongoose = require('mongoose');
const Document = require('./server/Document');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 9001;

mongoose.connect(process.env.MONGO_URL || process.env.DB_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
}, () => {
    console.log('Conected to db!');
});

if (process.env.NODE_ENV === 'production') {
    // Exprees will serve up production assets
    app.use(express.static('client/build'));
}

const io = require("socket.io")(PORT, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    },
})
  

io.on("connection", socket => {
    socket.on('get-document', async documentId => {
        const document = await findorCreateDocument(documentId);

        // const data = "some earlier data of the your document";
        socket.join(documentId);
        socket.emit('load-document', document.data);

        socket.on('send-changes', delta => {
            socket.broadcast.emit('receive-changes', delta);
        })

        socket.on('save-document', async data => {
            await Document.findByIdAndUpdate(documentId, { data });
        })
    })
})

const defaultValue = "";

async function findorCreateDocument(id){
    if(id == null) return
    const document = await Document.findById(id);

    if(document) return document;

    return await Document.create({_id : id, data : defaultValue});
}