import express from "express";

const app=express();
// import cors from "cors";
import client from "prom-client";
import {createLogger,transports} from "winston"
import LokiTransport from "winston-loki";
const options = {
    
    transports: [
      new LokiTransport({
        host: "http://192.168.137.1:3100"
      })
    ]
  };
  const logger = createLogger(options);
// app.use(cors());
const collectDefaultMetrics=client.collectDefaultMetrics;
// console.log(collectDefaultMetrics.metricsList.processCpuTotal);
collectDefaultMetrics({
    register:client.register
});


const PORT=process.env.PORT || 8000

app.get("/",(req,res)=>{
    logger.info("Request cane to this route")
    res.json("Hello world");
})

function getRandomValue(array){
    return array[Math.floor(Math.random(0,1)*array.length)];
}

function HeavyTask(){
    const ms=getRandomValue([100,200,300,600,1000,1400,2500]);
    const shouldThrowError=getRandomValue([1,2,3,4,5,6,7,8])===8;
    if(shouldThrowError){
        const randomError=getRandomValue
        ([
            "DB Payment Failure",
            "Db Server is Down",
            "Access Denied",
            "Not Found Error",
        ]);
        throw new Error(randomError);
    }
    return new Promise((resolve,reject)=> setTimeout(()=>resolve(ms),ms));
}

app.get("/slow",async(req,res)=>{

    try {
        const timeTaken=await HeavyTask();
        return res.json({
            status:"Success",
            message:"Completed in "+timeTaken+" ms",
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({
            status:"Error",
            error:"Server Error",
        });
    }
    
});

app.get("/metrics",async(req,res)=>{
    res.setHeader('Content-Type',client.register.contentType);
    const metrics=await client.register.metrics();
    // console.log(metrics);
    res.send(metrics);
})

app.listen(PORT,()=>{
    console.log("Server Listening to PORT "+PORT);
})