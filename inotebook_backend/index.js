const connectToMongo = require('./db');
const express = require('express');
const app = express()
const port = 3030;

connectToMongo();

app.use(express.json())
app.get('/', (req, res) => {
    res.send('hello world')
  })

app.use('/api/user', require('./routes/auth'))
app.use('/api/notes', require('./routes/note'))
  
  app.listen(port, ()=>{console.log("listening on port: "+port)})
