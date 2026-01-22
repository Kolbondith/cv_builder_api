

//Controller for create a new resume

import Resume from "../models/ResumeModel.js";
import imagekit from "../config/imageKit.js";
import fs from 'fs'

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
        return res.status(200).json({ message: 'resume delete successfully' })
    } catch (error) {
        console.log(error.message)
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
        let { resumeId, resumeData, removeBackground } = req.body;

        // Convert JSON string → object
        if (typeof resumeData === "string") {
            resumeData = JSON.parse(resumeData);
        }

        // Remove fields that must NOT be updated manually
        delete resumeData._id;
        delete resumeData.userId;
        delete resumeData.createdAt;

        // Handle image (Multer)
        const image = req.file;
        if (image) {
            const imageBufferData = fs.createReadStream(image.path);

            const response = await imagekit.files.upload({
                file: imageBufferData,
                fileName: `resume-${resumeId}.png`,
                folder: 'user-resumes',
                transformation: {
                    pre: 'w-300,h-300,fo-face.z-0.75' +
                        (removeBackground ? ',e-bgremove' : '')
                }
            });

            // Attach image URL to resumeData before saving
            resumeData.personal_info = {
                ...resumeData.personal_info,
                image: response.url
            };
        }

        const updated = await Resume.findOneAndUpdate(
            { userId, _id: resumeId },
            { $set: resumeData },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "resume not found" });
        }

        return res.status(200).json({
            message: "Save Successfully",
            resume: updated
        });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};