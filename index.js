import express from 'express';
import bodyParser from 'body-parser'
const app = express();
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

let date = new Date();
let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let date_string = `${days[date.getDay()]} , ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
let todo = [];
let todo_work = []

app.get("/", (req, res) => {
   res.render("index.ejs", {
			date: date_string,
			todo: todo,
		})
})

app.post("/", (req, res) => {
   todo.push(req.body.task);
   res.render("index.ejs",{
    date: date_string,
    todo: todo
   })
})

app.get('/work', (req, res) => {
    res.render("index.ejs", {
			todo: todo_work,
		})
})

app.post('/work',(req, res) => {
   todo_work.push(req.body.task)
   res.redirect('/work')
})

app.listen(3000,()=>{
    console.log("listening on port 3000");
})