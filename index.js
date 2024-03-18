const express = require('express');
const mongoose = require('mongoose');
const {nanoid} = require('nanoid')
const app = express();
const PORT = 8000;
const path = require('path');
let d = new Date();

//template engine *start*
app.set('view engine','ejs');
//template engine *end*

app.use(express.json())
app.use(express.urlencoded({extended:false}))

mongoose.connect('mongodb://localhost:27017/shortner').then(data => console.log('Connected Mongo db 127.0.0.1 at the port 27017'));
const urlSchema = new mongoose.Schema({
    shortURL:{
        type:String,
        required:true,
        unique:true
    },
    redirectURL:{
        type:String,
        required:true
    },
    details:[{timestamp:{type:String}}]
})
const urlModel = mongoose.model('details',urlSchema);

app.get('/home',async(req,res) => {
    let data =await urlModel.find();
    res.render('home',{
        newURL:"not defined yet!",
        page:0,
        datas:data[0],
        port:PORT
    })
})
app.get('/analytics',async (req,res) => {
    let datas =await urlModel.find()
    res.render('analytics',{
        data:datas,
        port:PORT
    })
})
app.post('/url',async (req,res) => {
    let body =await req.body;

    let checkAvailablity = await urlModel.findOne({redirectURL:body.url});

    if(!body || !body.url){
        res.status(400).json({msg:`url is need as a body in order to create that into a short form`})
    }else{
        if(checkAvailablity == null){
            let id = nanoid(8)
            let data = new urlModel({
                shortURL:id,
                redirectURL:body.url,
                details:[{
                    timestamp:`${d.getDate()}/${d.getMonth()}/${d.getFullYear()} at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
                }]
            })
            await data.save()
            return res.render('home',{
                newURL:data.shortURL,
                page:1,
                port:PORT
            })
        }else{
            return res.render('home',{
                newURL:checkAvailablity.shortURL,
                page:1,
                port:PORT
            })
        }
    }
})
app.get('/go/:id',async (req,res) => {
    let data = await urlModel.find({shortURL:req.params.id})
    await urlModel.updateOne({shortURL:req.params.id},{$push:{details:{
    timestamp:`${d.getDate()}/${d.getMonth()}/${d.getFullYear()} at ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
    }}})
    res.redirect(data[0].redirectURL);
})
app.listen(PORT,'127.0.0.1',() => console.log(`listening to the port ${PORT}, open the landing page with http://localhost:8000/home`));