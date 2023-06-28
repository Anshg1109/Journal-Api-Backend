const express = require("express");
const router = express.Router();

const {
  createJournal,
  updateJournal,
  deleteJournal,
  publishJournal,
  getTeacherJournals,
  getStudentJournals,
} = require("../controllers/journalController");

const validateToken = require("../middleware/validateTokenHandler");

router.use(validateToken);

// Create a journal as a teacher
router.post("/journal", createJournal);

// Update a journal as a teacher
router.put("/journal/:id", updateJournal);

// Delete a journal as a teacher
router.delete("/journal/:id", deleteJournal);

// Publish a journal as a teacher
router.put("/journal/:id/publish", publishJournal);

// Journal feed for teachers
router.get("/journal/feed/teacher", getTeacherJournals);

// Journal feed for students
router.get("/journal/feed/student", getStudentJournals);

module.exports = router;
