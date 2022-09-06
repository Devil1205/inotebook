const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/FetchUser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

//Route - 1 Fetch all notes of logged in user
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try{
    const notes = await Notes.find({ user: req.user.id });
    res.status(200).json(notes);
}
catch(err)
{
    res.status(500).send("Some error occured");
}
})

//Route - 2 Create new note of logged in user
router.post("/createnote", fetchuser, [
    body('title', "Title can't be blank").exists(),
    body('description', "Description can't be blank").exists()
], async (req, res) => {
    try {
        //Express validator part
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const notes = await Notes.create({
            user: req.user.id,
            title: req.body.title,
            description: req.body.description,
            tag: req.body.tag
        })
        res.status(200).json(notes);
    }
    catch (err) { res.status(500).send("Some error occured") };
})

//Route - 3 Update existing note of logged in user
router.put("/update/:id", fetchuser, async (req, res) => {
    try{
    const { title, description, tag } = req.body;
    const newnote = {};
    if (title) {
        newnote.title = title;
    }
    if (description) {
        newnote.description = description;
    }
    if (tag) {
        newnote.tag = tag;
    }

    let notes = await Notes.findById(req.params.id);
    if (notes===null) {
        return res.status(404).send("Not found");
    }
    if (req.user.id !== notes.user.toString()) {
        return res.status(401).send("Access Denied");
    }
    notes = await Notes.findByIdAndUpdate(req.params.id, { $set: newnote }, { new: true });
    res.status(200).json(notes);
}
catch(err)
{
    res.status(500).send("Some error occured");
}
})

//Route - 4 Delete existing note of logged in user
router.delete("/delete/:id", fetchuser, async (req, res) => {
    try{
    let notes = await Notes.findById(req.params.id);
    if(notes===null)
    {
        return res.status(404).send("Not found");
    }
    if (req.user.id !== notes.user.toString()) {
        return res.status(401).send("Access Denied");
    }
    notes = await Notes.findOneAndDelete(req.params.id, notes);
    res.status(200).json(notes);
}
catch(err)
{
    res.status(500).send("Some error occured");
}
})

module.exports = router;