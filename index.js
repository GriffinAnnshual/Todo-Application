import express from 'express';
import bodyParser from 'body-parser'
import mongoose from 'mongoose';
const app = express();
import _ from 'lodash';

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());


let date = new Date()
let days = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
]
let date_string = `${
	days[date.getDay()]
}, ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`

const passwd = encodeURIComponent("root")
mongoose.connect(
	`mongodb://griffin:${passwd}@ac-mzpsjql-shard-00-00.dd5j48f.mongodb.net:27017,ac-mzpsjql-shard-00-01.dd5j48f.mongodb.net:27017,ac-mzpsjql-shard-00-02.dd5j48f.mongodb.net:27017/todolistDB?ssl=true&replicaSet=atlas-4iirde-shard-0&authSource=admin&retryWrites=true&w=majority`,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
)

const itemsSchema = {
    todo: String
};

const listSchema = {
	name: String,
	listItems: [itemsSchema]
}

const Item = mongoose.model('Item', itemsSchema);
const workItem = mongoose.model('WorkItem', itemsSchema);
const list = mongoose.model('List', listSchema);


app.get("/", async(req, res) => {
 await Item.find({})
		.then((items) => {
			res.render("index.ejs", {
				date: date_string,
				todo: items,
			})
		})
		.catch((err) => {
			console.log("Error finding")
		})
})


app.get('/work', async(req, res) => {
 await workItem.find({})
		.then((items) => {
			res.render("index.ejs", {
				work: "work",
				todo: items,
			})
		})
		.catch((err) => {
			console.log("Error finding")
		})
})

app.get("/:choiceList",async(req,res)=>{
	const name = _.capitalize(req.params.choiceList);
	await list.findOne({name: name})
	.then((choice)=>{
		if (choice) {
			res.render("index.ejs", {
				name: name,
				todo: choice.listItems,
			})
		} else {
			const newitem = new list({
				name: name,
				listItems: [],
			})
			newitem.save()
			res.redirect(`/${name}`)
		}

	})
	.catch((error)=>{console.log("Error rendering: " + error)});
})


app.post("/", async (req, res) => {
	const item = new Item({
		todo: req.body.task,
	})
	await item
		.save()
		.then(() => {
			console.log("Item inserted")
		})
		.catch((err) => {
			console.log(err)
		})
	res.redirect("/")
})

app.post('/work',async(req, res) => {
    const item = new workItem({
			todo: req.body.task,
		})
		await item.save()
			.then(() => {
				console.log("Item inserted")
			})
			.catch((err) => {
				console.log("Error inserting item")
			})
    res.redirect("/work")
})

app.post("/delete", async(req, res) => {
		console.log(req.body.checkbox)
        await Item.findOneAndRemove({_id: req.body.checkbox})
		.then(()=>{console.log("Item deleted")})
		.catch(()=>{console.log("Error deleting")});
 		res.redirect('/');
})

app.post("/deletework", async (req, res) => {
	console.log(req.body.checkbox)
	await workItem.findOneAndRemove({ _id: req.body.checkbox })
		.then(() => {
			console.log("Item deleted")
		})
		.catch(() => {
			console.log("Error deleting")
		})
		res.redirect("/work")
})


app.post("/deletemany", async (req, res) => {
	const name = req.body.name
	const id = req.body.checkbox
	await list.findOneAndUpdate({name: name},{$pull :{listItems: {_id: id}}}  // to find a document from an array.
		).then(() => {
			console.log("Item deleted")
		})
		.catch(() => {
			console.log("Error deleting")
		})
	res.redirect(`/${name}`)
})

app.post("/:choiceList", async (req, res) => {
	const name = req.params.choiceList
	const item = {
		todo: req.body.task,
	}
	await list
		.findOne({ name: name })
		.then((choice) => {
			choice.listItems.push(item)
			choice.save()
			res.redirect(`/${name}`)
		})
		.catch((error) => {
			console.log("error: " + error)
		})
})

app.listen(3000,()=>{
    console.log("listening on port 3000");
})

