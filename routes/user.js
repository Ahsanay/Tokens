const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const User=require('../models/user.js')
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const { token } = require('morgan');
require('dotenv').config();

//Create User
router.post('/signup',(req,res,next)=>{
     User.find({email:req.body.email}).exec().then(user=>{
        if(user.length>=1){
           return res.status(409).json({
            message:'User Already exists'
           });
        }   
        else{
            bcrypt.hash(req.body.password,5, (err,hash)=>{
                if(err){
                   return res.status(500).json({
                       error:err
                   });
                }
                else{
                    const user = new User({
                        _id:mongoose.Types.ObjectId(),
                        email:req.body.email,
                        password: hash
                    });
                    user.save()
                    .then(result=>{
                        console.log(result);
                        res.status(200).json({
                            message:'User created'
                        })
                    })
                    .catch(err=>{
                        console.log(err);
                        res.status(500).json({
                            error:err
                        })
                    });
                   
                }
           });
        }

  

     });

});

//Delete User
router.delete("/:userId", (req, res, next) => {
    const id=req.params.userId;
    User.remove({ _id: id })
      .exec()
      .then(result => {
        res.status(200).json({
          message: "User deleted"
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });

//User Login
  router.post('/login',(req,res,next)=>{
      User.findOne({email:req.body.email})
      .exec()
      .then(user=>{
        if(user.length<1){
            return res.status(401),json({
                message:'Auth Failed'
            });
        }
        bcrypt.compare(req.body.password, user.password,(err,result)=>{
            if(err){
                return res.status(401).json({
                    message:'Auth Failed'
                })
            }
            if(result){
              const token=  jwt.sign({
                    email:user.email,
                    userId:user._id
                },
                process.env.JWT_KEY,
                {
                    expiresIn:"1h",
                }
                )
                const refreshtoken=  jwt.sign({
                    email:user.email,
                    userId:user._id
                },
                process.env.REFRESH_TOKEN_KEY,
                {
                    expiresIn:"8h",
                }
                )

                return res.status(201).json({
                    message :'Auth Successfull',
                    accestoken:token,
                    refreshtoken:refreshtoken
                });


                
            }
            return res.status(401).json({
                message:'Auth Failed'
               
            });
        })
      })
      .catch();

  });

  router.post('/token',(req,res,next)=>{
    const refreshtoken= req.header('x-auth-token');
    console.log(refreshtoken);
 
    
    
    try {
        const decoded=jwt.verify(refreshtoken,process.env.REFRESH_TOKEN_KEY);
   //     req.userData=decoded;
        const {email}=decoded;
        const {_id}=decoded;
        const accesstoken=  jwt.sign({
            email:{email},
            userId:{_id}
        },
        process.env.JWT_KEY,
        {
            expiresIn:"20s",
        }
        )
        res.json({
            access:accesstoken
        })

    } catch (err) {
        res.status(403).json({
            error:err
        })
    }
  });

//Get User
router.get("/:userId", (req, res, next) => {
    const id=req.params.userId;
    User.find({ _id: id })
    .select('email _id')
      .exec()
      .then(result => {
        res.status(200).json({
          User: result
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });


  //Update user
  router.patch('/:userId',(req,res,next)=>{
    const id=req.params.userId;
    const updateOps={};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    
    User.update({_id:id}, { $set : updateOps}).
    exec().
    then(result=>{
      
        res.status(200).json({
            message: 'User successfully updated',
            request:{
                type:'GET',
                URL:'http://localhost:3000/user/'+id
            }
        });
    }).
    catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    })
});

module.exports=router;