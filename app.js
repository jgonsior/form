const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const {Pool, Client} = require("pg");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let url = process.env.DATABASE_URL;
if(url == null || url == ""){
  url = "postgres...";
}

const pool = new Pool({
  connectionString: url,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect();

// pool.query('DROP TABLE formular_arbeitsschritte, formular_recherche, formular, arbeitsschritte, recherche', function(err, res){
//   console.log("gelöscht");
// });

//create tables if they dont exist
pool.query('CREATE TABLE IF NOT EXISTS formular (id SERIAL PRIMARY KEY,formular VARCHAR(5), datum DATE,mitarbeiter VARCHAR(50),projektkennung VARCHAR(300),nachgeschautes_erfahrungswissen VARCHAR(5000),gelerntes VARCHAR(5000));CREATE TABLE IF NOT EXISTS arbeitsschritte (name VARCHAR(50) PRIMARY KEY);CREATE TABLE IF NOT EXISTS recherche (name VARCHAR(50) PRIMARY KEY);CREATE TABLE IF NOT EXISTS formular_arbeitsschritte (form_id SERIAL,as_name VARCHAR(50),PRIMARY KEY(form_id, as_name),FOREIGN KEY (form_id) REFERENCES formular(id),FOREIGN KEY (as_name) REFERENCES arbeitsschritte(name));CREATE TABLE IF NOT EXISTS formular_recherche (form_id SERIAL,re_name VARCHAR(50),beschreibung VARCHAR(500),PRIMARY KEY(form_id, re_name),FOREIGN KEY (form_id) REFERENCES formular(id),FOREIGN KEY (re_name) REFERENCES recherche(name));', function(err, res){
  if(!err){
    //fill tables with data if these not already exist - arbeitsschritte
    pool.query("INSERT INTO arbeitsschritte VALUES($1), ($2), ($3), ($4), ($5), ($6), ($7), ($8), ($9), ($10), ($11), ($12), ($13), ($14), ($15), ($16), ($17), ($18), ($19), ($20), ($21), ($22), ($23), ($24) ON CONFLICT DO NOTHING;",['makrofoto', 'einbetten_vor_trennen', 'trennen', 'einbetten', 'schleifen', 'polieren', 'endpolieren', 'vibrationspolieren', 'ätzen', 'lichtmikroskopie', 'härtemessung', 'ionenpolitur_csp', 'ionenpolitur_pips', 'fib', 'e-polieren', 'werkstoff', 'herstellungsverfahren', 'wärmebehandlung', 'probenanzahl/versuchsreihen', 'probengeometrie', 'probenvorbereitung', 'versuchsstand_einrichten', 'versuchsdurchführung', 'auswertung/prüfbericht'], function(err, res){
      if(err){
        console.log(err);
      }
    });
    //fill table with data if these not already exist - recherche
    pool.query("INSERT INTO recherche VALUES($1), ($2), ($3), ($4), ($5), ($6), ($7), ($8), ($9), ($10), ($11), ($12), ($13) ON CONFLICT DO NOTHING;",['austausch_mit_kollegen', 'auswertung_4_augen_prinzip', 'abteilungsrunde', 'arbeitsanweisungen', 'maschinentagebücher', 'persönliches_laborbuch', 'bauchgefühl', 'präparationsguide', 'wochenliste', 'ordnerablage', 'datenbank','tägliche_absprachen', 'sonstiger_weg'], function(err, res){
      if(err){
        console.log(err);
      }
    });
  }else{
    console.log(err);
  }
});

// pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'", function(err, res){
//   console.log(res);
// });

app.get("/", function(req, res) {
  res.render("selection", {success: false});
});

app.get("/success", function(req, res){
  res.render("selection", {success: true});
});

app.get("/data", function(req, res) {
      var form_result = [];
      var abs_result = [];
      var re_result = [];
      var arbeitsschritte_result = [];
      var recherche_result = [];
      pool.query('SELECT * FROM formular', function(form_err, form_outcome) {
        if (form_err) {
          console.log(form_err);
        } else {
          form_result = form_outcome.rows;
          pool.query('SELECT * FROM formular_arbeitsschritte', function(abs_err, abs_outcome) {
            if (abs_err) {
              console.log(abs_err);
            } else {
              abs_result = abs_outcome.rows;
              pool.query('SELECT * FROM formular_recherche', function(re_err, re_outcome) {
                if (re_err) {
                  console.log(re_err);
                } else {
                  re_result = re_outcome.rows;
                  pool.query('SELECT * FROM arbeitsschritte', function(arbeitsschritte_err, arbeitsschritte_outcome) {
                    if(arbeitsschritte_err){
                      console.log(arbeitsschritte_err);
                    }else{
                      arbeitsschritte_result = arbeitsschritte_outcome.rows;
                      pool.query('SELECT * FROM recherche', function(recherche_err, recherche_outcome) {
                        if(recherche_err){
                          console.log(recherche_err);
                        }else{
                          recherche_result = recherche_outcome.rows;
                          res.render("data", {
                            formular: form_result,
                            abs: abs_result,
                            re: re_result,
                            arbeit: arbeitsschritte_result,
                            recherche: recherche_result
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
});

app.get("/data/:x", function(req, res) {
      const x = req.params.x;
      var form_result = [];
      var abs_result = [];
      var re_result = [];
      var arbeitsschritte_result = [];
      var recherche_result = [];
      pool.query('SELECT * FROM formular WHERE formular = $1',[x], function(form_err, form_outcome) {
        if (form_err) {
          console.log(form_err);
        } else {
          form_result = form_outcome.rows;
          pool.query('SELECT * FROM formular_arbeitsschritte', function(abs_err, abs_outcome) {
            if (abs_err) {
              console.log(abs_err);
            } else {
              abs_result = abs_outcome.rows;
              pool.query('SELECT * FROM formular_recherche', function(re_err, re_outcome) {
                if (re_err) {
                  console.log(re_err);
                } else {
                  re_result = re_outcome.rows;
                  pool.query('SELECT * FROM arbeitsschritte', function(arbeitsschritte_err, arbeitsschritte_outcome) {
                    if(arbeitsschritte_err){
                      console.log(arbeitsschritte_err);
                    }else{
                      arbeitsschritte_result = arbeitsschritte_outcome.rows;
                      pool.query('SELECT * FROM recherche', function(recherche_err, recherche_outcome) {
                        if(recherche_err){
                          console.log(recherche_err);
                        }else{
                          recherche_result = recherche_outcome.rows;
                          res.render("data", {
                            formular: form_result,
                            abs: abs_result,
                            re: re_result,
                            arbeit: arbeitsschritte_result,
                            recherche: recherche_result
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
});

app.get("/:form", function(req, res){
  const form = req.params.form;
  res.render(form + ".ejs");
});

app.post("/", function(req, res){
  const body = req.body;
  const formular = req.body.titel;
  const datum = req.body.datum;
  const mitarbeiter = req.body.mitarbeiter;
  const projekt = req.body.projektkennung;
  const erfahrung = req.body.erfahrungswissen;
  const gelerntes = req.body.gelerntes;

  pool.query('INSERT INTO formular VALUES(DEFAULT, $1, $2, $3, $4, $5, $6) RETURNING id;', [formular, datum, mitarbeiter, projekt, erfahrung, gelerntes] , function(err, res){
    if(err){
      console.log(err);
    }else{
      var form_id = res.rows[0].id
      for(var att in body){
        if(att.startsWith("abs_")){
          pool.query('INSERT INTO formular_arbeitsschritte VALUES($1, $2);', [form_id, att.substring(4)] , function(err, res){
            if(err){
              console.log(err);
            }
          });
        }else if(att.startsWith("re_")){
          var sonstiger_weg = ''
          if(att === "re_sonstiger_weg"){
              sonstiger_weg = req.body.sonstiger_weg_text;
          }
          pool.query('INSERT INTO formular_recherche VALUES($1, $2, $3);', [form_id, att.substring(3), sonstiger_weg] , function(err, res){
            if(err){
              console.log(err);
            }
          });
        }
      }
    }
  });
  console.log("Das Formular wurde gespeichert!");
  res.redirect("/success");
});



let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port);
