const express=require('express');
const app=express();
const morgan=require('morgan');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
require('dotenv').config();

const userRoutes=require('./routes/user.js')

mongoose.set("strictQuery", true);
const uri="mongodb+srv://WebDev:Ahsan123@cluster0.k4vax4d.mongodb.net/test";
mongoose.connect(uri);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if(res.method=='OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET')
        return res.status(200).json({});
    }
    next();
    })

app.use('/user',userRoutes);

app.use((req,res,next)=>{
const error=new Error('Not found');
error.status=404;
next(error);
})

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    })
    })

module.exports=app;