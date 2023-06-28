const express = require("express");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Journal = require("../models/journalModel");


// Create a journal as a teacher
//asyncHandler will automatially pass the errors to errorhandler, no need to write try catch blocks
const createJournal= asyncHandler(async (req, res) => {
  // Check if the user is a teacher
  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { title, content, tags, publishedAt } = req.body;
  if (!title || !content || !tags || !publishedAt) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }

  const currentDate = new Date();
  if (new Date(publishedAt).getTime() > currentDate.getTime()) {
    res.status(200).json({ message: "Journal scheduled for future publication" });
    return;
  }

  const journal = await Journal.create({
    title,
    content,
    tags,
    createdBy: req.user.id,
    publishedAt,
  });

  res.status(201).json(journal);
});



// Update a journal as a teacher
const updateJournal = asyncHandler(async (req, res) => {
  // Check if the user is a teacher
  const journal = await Journal.findById(req.params.id);
  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Access denied" });
  }
  if (journal.createdBy.toString() !== req.user.id){
    res.status(403);
    throw new Error("Uer don't have permission to update other user contracts");
  }
  const { title, content, tags } = req.body;
  if (!title || !content || !tags) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const updatedJournal = await Journal.findById(
    req.params.id,
    req.body,
    {new: true}
    );
  res.status(200).json(updatedJournal);
});


// Delete a journal as a teacher
const deleteJournal = asyncHandler(async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Access denied" });
  }
  const journal = await Journal.findById(req.params.id);
  if (!journal) {
    res.status(404);
    throw new Error("Journal not found");
  }
  if (journal.createdBy.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User doesn't have permission to delete this journal");
  }
  await Journal.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: "Journal deleted" });
});

const publishJournal = asyncHandler(async (req, res) => {
  // Check if the user is a teacher
  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Access denied" });
  }

  const journal = await Journal.findById(req.params.id);
  if (!journal) {
    res.status(404);
    throw new Error("Journal not found");
  }

  if (journal.published) {
    res.status(400);
    throw new Error("Journal is already published");
  }

  const { publishedAt } = req.body;

  if (new Date(publishedAt) > new Date()) {
    res.status(400);
    throw new Error("Cannot publish a journal with a future publishing date");
  }

  journal.published = true;
  journal.publishedAt = publishedAt;

  const publishedJournal = await journal.save();
  res.status(200).json(publishedJournal);
});


// Journal feed for teachers
const getTeacherJournals = asyncHandler(async (req, res) => {
  // Check if the user is a teacher
  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Access denied" });
  }

  const journals = await Journal.find({ createdBy: req.user.id });
  if (!journals){
    res.status(404);
    throw new Error("No Journals Found");
  }
  res.status(200).json({ journals });
});

// Journal feed for students
const getStudentJournals = asyncHandler(async (req, res) => {
  // Check if the user is a student
  if (req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied" });
  }

  const currentDate = new Date();

  const journals = await Journal.find({
    tags: req.user.id,
    published: true,
    publishedAt: { $lte: currentDate },
  });
  if (!journals){
    res.status(404);
    throw new Error("No tags Found");
  }
  res.status(200).json({ journals });
});


module.exports = {
  createJournal,
  updateJournal,
  deleteJournal,
  getTeacherJournals,
  getStudentJournals,
  publishJournal
};