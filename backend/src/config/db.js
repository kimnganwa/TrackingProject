import mongoose from "mongoose"


export const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
            console.log("Database connected successfully")
    } catch (error) {
        console.log("Database connected failed",error);
        process.exit(1)
    }
}
