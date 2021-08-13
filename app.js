//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({extended : true}));

mongoose.connect("mongodb+srv://admin-vishal:Vishal123@cluster0.qyegh.mongodb.net/todolistDB", {useNewUrlParser : true}, { useUnifiedTopology: true });
const itemSchema = new mongoose.Schema(
    {
        name : String
    }
);
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name : "BE, BREATHE, BLOSSOM"
});
const item2 = new Item({
    name : "Hit the + button to add task"
});
const item3 = new Item({
    name : "<-- Click this buttton if you have completed the task"
});

const listSchema = new mongoose.Schema({
    name : String,
    items : [itemSchema]
});
const List = mongoose.model("List", listSchema);

//var items = ["Namasakaram ANNA"];
defaultItems = [item1, item2, item3];

app.set('view engine', 'ejs');
app.use(express.static("public"));

var today = new Date();
    var options = {
        weekday : "long",
        day : "numeric",
        month : "long"
    }
var currentDay = today.toLocaleDateString("en-US", options);
app.get("/", function(req, res){
    Item.find({}, function(err, foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    console.log("Item inserted into DB successfully");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list", {listTitle: "Today", newListItem : foundItems});
        }
    });
});

app.get("/:customListName", function(req, res){
    const customListName = req.params.customListName;

    List.findOne({name : customListName}, function(err, foundList){
        if(!err)
        {
            if(!foundList)
            {
                const list = new List({
                    name : customListName,
                    items : defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else{
                res.render("list", {listTitle : foundList.name, newListItem : foundList.items})
            }
        }
        else{
            console.log("Error occured while creating" + customListName)
        }
    });
})

app.post("/", function(req, res){
    var itemName = req.body.newItem;
    const listName = req.body.list;
    // items.push(item);

    const item = new Item({
        name : itemName
    });
    if(listName === "Today")
    {
        item.save();
        res.redirect("/");
    }
    else
    {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function(req, res){
    //console.log(req.body.checkbox);
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today")
    {
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err)
            {
                console.log("Successfully deleted " + checkedItemId);
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name : listName}, {$pull : {items : {_id : checkedItemId}}}, function(err, foundList){
            if(!err)
            {
                res.redirect("/" + listName);
            }
        });
    }
    
})

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
