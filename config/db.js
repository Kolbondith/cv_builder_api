import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => { console.log("Database connected successfully") })

        let mongodbURI = process.env.DATABASE_URI
        const projectName = 'cv-builder'

        if (!mongodbURI) {
            throw new Error("MongoDbURI environment not set ")
        }
        if (mongodbURI.endsWith('/')) {
            mongodbURI = mongodbURI.slice(0, -1)
        }

        await mongoose.connect(`${mongodbURI}/${projectName}`)
    } catch (err) {
        console.error("Error Connecting to mongoDb", err)
    }
};
export default connectDB;
