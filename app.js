const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const {Pool, Client} = require("pg");

const credentials = {
  database: "d3u3v2tqlgvtfc",
  host: "ec2-54-228-95-1.eu-west-1.compute.amazonaws.com",
  port: 5432,
  user: "tteoeocadcqwsb",
  password: "36f316bbff302493488957fd3d06d2195b5e59ccb85d8b4f19212c6f646e5e6c",
  sslmode: "require"
}

const pool = new Pool({
  connectionString: "postgres://tteoeocadcqwsb:36f316bbff302493488957fd3d06d2195b5e59ccb85d8b4f19212c6f646e5e6c@ec2-54-228-95-1.eu-west-1.compute.amazonaws.com:5432/d3u3v2tqlgvtfc",
  ssl: true
});

const client = new Client(credentials);

pool.connect();

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  res.render("selection");
  pool.query('SELECT * FROM test', function(err, res){
    if(!err){
      console.log(res.rows);
    }else{
      console.log(err);
    }
  });
});

app.get("/:form", function(req, res){
  const form = req.params.form;
  res.render(form + ".ejs");
})







let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port);
