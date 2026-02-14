import mongoose from "mongoose";
//extending the type of global node.js object to include a property called mongoose
//otherwise typescript will scream like hell
declare global{
    var mongoose:{
        conn:mongoose.Connection | null;
        promise: Promise<mongoose.Connection>| null; 
    }
}
//getting the url from .env
const MONGODB_URI=process.env.MONGODB_URI;

if(!MONGODB_URI){
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    )
}

//accessing the global connection object stored in global object of node.js
let cached=global.mongoose;

if(!cached){
    cached=global.mongoose={ conn:null, promise:null} //both cached and global.mongoose are pointing to the same object 
}

//nextjs does not kill the entire nodejs process when files are saved it may run the connection multiple times and mongodb will raise obbjection that you cannot connect too many times 
//this is not the problem in express js since the entire process is killed when the server is restarted , mongodb will not allow connection from the same app instance multiple times
//so ewe have to cache the connection if connection already exists we will reuse it otherwise create it, and for it to persists refreshes in nextjs we store it in the nodejs global object
async function connectDB():Promise<mongoose.Connection>{
    if(cached.conn){
        return cached.conn;
    }

    if(!cached.promise){
        const options: mongoose.ConnectOptions={
            bufferCommands:false //don't store queeries in buffer if connection is not made immediately raise error
        }

        cached.promise= mongoose.connect(MONGODB_URI!,options).then((mongooseInstance)=>mongooseInstance.connection);
    }

    try{
        cached.conn=await cached.promise;
    }
    catch(error){
        cached.promise=null;
        throw error;
    }

    return cached.conn;
}

export default connectDB;

