const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  res.render("selection");
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
