import mongoose from "mongoose";
import bcrypt from 'bcrypt'


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        password: {
            type: String,
            default: null // For Google users (no password)
        },

        google_id: {
            type: String,
            default: null // Use default instead of allowNull
        }
    },
    { timestamps: true }
);
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

const User = mongoose.model("User", userSchema);

export default User;