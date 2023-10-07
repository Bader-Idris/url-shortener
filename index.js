require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const connectDB = require('./db/connect');

const myRouter = require('./myRouter')

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use('/api', myRouter)

app.get('*', function (req, res) {
  res.send(
    '<pre>not found</pre>' +
    `<style>
      body {background-color: #121212;
      color: #fff;
    }</style>`
  );
});


const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);//check these as: URI_var, { useNewUrlParser: true, useUnifiedTopology: true }
    app.listen(port, () =>
      console.log(`Listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();