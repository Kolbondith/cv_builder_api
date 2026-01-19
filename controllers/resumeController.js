

//Controller for create a new resume

import Resume from "../models/ResumeModel";

// Post: /api/resume/create
export const createResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { title } = req.body;

        // create new resume 
        const newResume = await Resume.create({ userId, title })
        // return success message 
        return res.status(201).sjon({ message: 'resume create successfully', resume: newResume })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}