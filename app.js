const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var XLSX = require("xlsx");
const {Pool, Client} = require("pg");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let url = process.env.DATABASE_URL;
if(url == null || url == ""){
  url = "postgres://";
}

const pool = new Pool({
  connectionString: url,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect();

// pool.query('DROP TABLE formular_arbeitsschritte_recherche, formular, arbeitsschritte, recherche', function(err, res){
//   console.log("gelöscht");
// });

//create tables if they dont exist
pool.query('CREATE TABLE IF NOT EXISTS formular (id SERIAL PRIMARY KEY,formular VARCHAR(5), company VARCHAR(30), datum DATE,mitarbeiter VARCHAR(50),projektkennung VARCHAR(300),nachgeschautes_erfahrungswissen VARCHAR(5000),gelerntes VARCHAR(5000));CREATE TABLE IF NOT EXISTS arbeitsschritte (name VARCHAR(50) PRIMARY KEY);CREATE TABLE IF NOT EXISTS recherche (name VARCHAR(50) PRIMARY KEY);CREATE TABLE IF NOT EXISTS formular_arbeitsschritte_recherche (form_id SERIAL,as_name VARCHAR(50), re_name VARCHAR(50),sonstiger_weg_text VARCHAR(500), PRIMARY KEY(form_id, as_name, re_name),FOREIGN KEY (form_id) REFERENCES formular(id),FOREIGN KEY (as_name) REFERENCES arbeitsschritte(name), FOREIGN KEY (re_name) REFERENCES recherche(name));', function(err, res){
  if(!err){
    //fill tables with data if these not already exist - arbeitsschritte
    pool.query("INSERT INTO arbeitsschritte VALUES($1), ($2), ($3), ($4), ($5), ($6), ($7), ($8), ($9), ($10), ($11), ($12), ($13), ($14), ($15), ($16), ($17), ($18), ($19), ($20), ($21), ($22), ($23), ($24) ON CONFLICT DO NOTHING;",['makrofoto', 'einbetten_vor_trennen', 'trennen', 'einbetten', 'schleifen', 'polieren', 'endpolieren', 'vibrationspolieren', 'ätzen', 'lichtmikroskopie', 'härtemessung', 'ionenpolitur_csp', 'ionenpolitur_pips', 'fib', 'e-polieren', 'werkstoff', 'herstellungsverfahren', 'wärmebehandlung', 'probenanzahl/versuchsreihen', 'probengeometrie', 'probenvorbereitung', 'versuchsstand_einrichten', 'versuchsdurchführung', 'auswertung/prüfbericht'], function(err, res){
      if(err){
        console.log(err);
      }
    });
    //fill table with data if these not already exist - recherche
    pool.query("INSERT INTO recherche VALUES($1), ($2), ($3), ($4), ($5), ($6), ($7), ($8), ($9), ($10), ($11), ($12), ($13), ($14) ON CONFLICT DO NOTHING;",['austausch_mit_kollegen', 'auswertung_4_augen_prinzip', 'abteilungsrunde', 'arbeitsanweisungen', 'maschinentagebücher', 'persönliches_laborbuch', 'bauchgefühl', 'präparationsguide', 'wochenliste', 'ordnerablage', 'datenbank','tägliche_absprachen', 'sonstiger_weg', 'null'], function(err, res){
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
  res.render("company");
});

app.get("/company/:x", function(req, res){
  const x = req.params.x;
  site = "selection";
  res.render(site, {success: false, company: x});
});

app.get("/success", function(req, res){
  res.render("company", {success: true});
});

app.get("/data", function(req, res) {
  var form_result = [];
  var abs_result = [];
  var recherche_result = []
  var arbeitsschritte_result = [];
  pool.query('SELECT * FROM formular', function(form_err, form_outcome) {
    if (form_err) {
      console.log(form_err);
    } else {
      form_result = form_outcome.rows;
      pool.query('SELECT * FROM formular_arbeitsschritte_recherche', function(abs_err, abs_outcome) {
        if (abs_err) {
          console.log(abs_err);
        } else {
          abs_result = abs_outcome.rows;
          pool.query('SELECT * FROM arbeitsschritte', function(arbeitsschritte_err, arbeitsschritte_outcome) {
            if (arbeitsschritte_err) {
              console.log(arbeitsschritte_err);
            } else {
              arbeitsschritte_result = arbeitsschritte_outcome.rows;
              pool.query('SELECT * FROM recherche', function(recherche_err, recherche_outcome) {
                if (recherche_err) {
                  console.log(recherche_err);
                } else {
                  recherche_result = recherche_outcome.rows;
                  res.render("data", {
                    selected_form: "all",
                    selected_company: "all",
                    formular: form_result,
                    abs: abs_result,
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
});

app.get("/data/:form/:company", function(req, res) {
  const form = req.params.form;
  const company = req.params.company;
  var form_result = [];
  var abs_result = [];
  var arbeitsschritte_result = [];
  var recherche_result = [];
  var x = 'SELECT * FROM formular WHERE formular = $1 AND company = $2';
  var y = [form, company];
  if(form === "all" && company === "all"){
    x = 'SELECT * FROM formular';
    y = [];
  }else if(form === "all"){
    x = 'SELECT * FROM formular WHERE company = $1';
    y = [company];
  }else if(company === "all"){
    x = 'SELECT * FROM formular WHERE formular = $1';
    y = [form]
  }
  pool.query(x, y, function(form_err, form_outcome) {
    if (form_err) {
      console.log(form_err);
    } else {
      form_result = form_outcome.rows;
      pool.query('SELECT * FROM formular_arbeitsschritte_recherche', function(abs_err, abs_outcome) {
        if (abs_err) {
          console.log(abs_err);
        } else {
          abs_result = abs_outcome.rows;
          pool.query('SELECT * FROM arbeitsschritte', function(arbeitsschritte_err, arbeitsschritte_outcome) {
            if (arbeitsschritte_err) {
              console.log(arbeitsschritte_err);
            } else {
              arbeitsschritte_result = arbeitsschritte_outcome.rows;
              pool.query('SELECT * FROM recherche', function(recherche_err, recherche_outcome) {
                if (recherche_err) {
                  console.log(recherche_err);
                } else {
                  recherche_result = recherche_outcome.rows;
                  res.render("data", {
                    selected_form: form,
                    selected_company: company,
                    formular: form_result,
                    abs: abs_result,
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
});

app.get("/:form/:company", function(req, res){
  const form = req.params.form;
  const company = req.params.company;
  res.render(form, {company: company});
});

app.post("/second", function(req, res){
  const body = req.body;
  const formular = req.body.titel;
  const datum = req.body.datum;
  const mitarbeiter = req.body.mitarbeiter;
  const projekt = req.body.projektkennung;
  const erfahrung = req.body.erfahrungswissen;
  const gelerntes = req.body.gelerntes;
  const company = req.body.company;
  const abs_array = [];
  for(var att in body){
    if(att.startsWith("abs_")){
      abs_array.push(att);
    }
  }
  var out = "form_" + formular + "_2";
  res.render(out, {
    formular: formular,
    datum: datum,
    mitarbeiter: mitarbeiter,
    projekt: projekt,
    erfahrung: erfahrung,
    gelerntes: gelerntes,
    company: company,
    abs_array: abs_array
  });

});

app.post("/", function(req, res){
  const body = req.body;
  const formular = req.body.titel;
  const datum = req.body.datum;
  const mitarbeiter = req.body.mitarbeiter;
  const projekt = req.body.projektkennung;
  const erfahrung = req.body.erfahrungswissen;
  const gelerntes = req.body.gelerntes;
  const company = req.body.company;

  pool.query('INSERT INTO formular VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7) RETURNING id;', [formular, company, datum, mitarbeiter, projekt, erfahrung, gelerntes] , function(err, res_f){
    if(err){
      console.log(err);
    }else{
      var form_id = res_f.rows[0].id
      for(var att in body){
        if(att.startsWith("abs_")){
          att = att.substring(4);
          var flag = 0;
          for(var att_re in body){
            if(att_re.startsWith(att)){
              flag = 1;
              var l = att.length;
              att_re = att_re.substring(l + 4);
              pool.query('INSERT INTO formular_arbeitsschritte_recherche VALUES($1, $2, $3, $4);', [form_id, att, att_re, ""], function(err_a, res_a){
                if(err_a){
                  console.log(err_a);
                }
              });
            }
          }if(flag === 0){
            pool.query('INSERT INTO formular_arbeitsschritte_recherche VALUES($1,$2,$3,$4);', [form_id, att, "null",""], function(err_b, res_b){
              if(err_b){
                console.log(err_b);
              }
            });
          }
        }else if(att.startsWith("sonstiger_weg_text_")){
          if(req.body[att] != ''){
            pool.query('INSERT INTO formular_arbeitsschritte_recherche VALUES($1, $2, $3, $4);', [form_id, att.substring(19), "sonstiger_weg", req.body[att]], function(err_a, res_a){
              if(err_a){
                console.log(err_a);
              }else{
                pool.query('SELECT * FROM formular_arbeitsschritte_recherche', function(re_err, re_outcome) {
                  if (re_err) {
                    console.log(re_err);
                  }
                });
              }
            });
          }
        }
      }
    }
  });

  console.log("Das Formular wurde gespeichert!");
  res.redirect("/success");
});

app.post("/export", function(req, res){
  const data = req.body.data;
  const form = data.split("|$&")[0];
  const sheets = data.split("|$&")[1];

  const array = [];
  const form_rows = form.split("|$%");
  form_rows.forEach(function(col){
    array.push(col.split("|$§"));
  });

  var columns = new Set();
  var sheet_dict = {};
  const tables = sheets.split("§");
  tables.forEach(function(element){
    const key = element.split("%")[0];
    const rows = element.split("%")[1];
    const id = rows.split(";,")[0];
    const values = rows.split(";,")[1];
    var sonstiger_weg = "";
    const tuple = [];
    if(values){
      values.split(",").forEach(function(ele){
        if(ele.startsWith("sonstiger_weg")){
          sonstiger_weg = ele.split("(|)")[1];
        }else{
          columns.add(ele);
          tuple.push(ele)
        }
      });
    }
    tuple.push(sonstiger_weg);
    tuple.push(id);
    if(key in sheet_dict){
      sheet_dict[key].push(tuple);
    }else{
      sheet_dict[key] = [tuple];
    }
  });

  var workbook = XLSX.utils.book_new();
  var worksheet_form = XLSX.utils.aoa_to_sheet(array);
  XLSX.utils.book_append_sheet(workbook, worksheet_form, "Table");

  for (const [key, value] of Object.entries(sheet_dict)) {
    const array_abs = [];
    const first_row = ["ID", "sonstiger Weg"];
    for(let item of columns){
      first_row.push(item);
    }
    array_abs.push(first_row);
    value.forEach(function(element){
      const next_rows = [];
      next_rows.push(element[element.length - 1]);
      next_rows.push(element[element.length - 2]);
      first_row.slice(2).forEach(function(ele){
        if(element.includes(ele)){
          next_rows.push("X");
        }else{
          next_rows.push("");
        }
      });
      array_abs.push(next_rows);
    });
    var worksheet_abs = XLSX.utils.aoa_to_sheet(array_abs);
    XLSX.utils.book_append_sheet(workbook, worksheet_abs, key);
  }

  XLSX.writeFileXLSX(workbook, "temp.xlsx");
  res.download("temp.xlsx");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port);
