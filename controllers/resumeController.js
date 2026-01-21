

//Controller for create a new resume

import Resume from "../models/ResumeModel.js";

// Post: /api/resume/create
export const createResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { title } = req.body;

        // create new resume 
        const newResume = await Resume.create({ userId, title })
        // return success message 
        return res.status(201).json({ message: 'resume create successfully', resume: newResume })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

//Delete: for deleting a resume

export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        // create new resume 
        await Resume.findOneAndDelete({ userId, _id: resumeId })
        // return success message 
        return res.status(200).sjon({ message: 'resume delete successfully' })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}


// get user resume by id 
//Get: /api/resumes/get 

export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ userId, _id: resumeId });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" })
        }

        resume.__v = undefined;
        resume.createdAt = undefined;
        resume.updatedAt = undefined;

        return res.status(200).json({ resume })


    } catch {
        return res.status(400).json({ message: error.message })
    }

}

// get resume by id public
//Get : /api/resumes/public 

export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const resume = await Resume.findOne({ public: true, _id: resumeId });

        if (!resume) {
            return res.status(404).json({ message: "status not found" })
        }

        return res.status(200).json({ resume })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Patch: /api/resume/edit

export const updateResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;
        const { resumeData } = req.body

        const newResume = await Resume.findOneAndUpdate({ userId, _id: resumeId }, resumeData, { new: true })
        if (!newResume) {
            return res.status(404).json({ message: "status not found" })
        }

        return res.status(200).json({ resume: newResume })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }

}