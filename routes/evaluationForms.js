const express = require('express');
const { EvaluationForm, FormStructure, SaveSharedEvaluatorForm } = require('../models/EvaluationForm');
const passport = require('passport');
const router = express.Router();
const ProgramManager=require('../models/ProgramManager');

// Middleware to handle JSON data
router.use(express.json());

// Evaluation Form Routes
// Create a new evaluation form 
router.post('/',passport.authenticate('jwt',{session:false}) ,async (req, res) => {
  try {
    const programManagerId = req.user._id;

    // Create a new Evaluation Form with the Program Manager's ID
    const evaluationForm = new EvaluationForm({
      ...req.body, // Spread form data from req.body
      programManager: programManagerId, // Add Program Manager's ID
    });
    await evaluationForm.save();
    await ProgramManager.findByIdAndUpdate(programManagerId, {
      $push: { evalForms: evaluationForm._id }, // Add evaluation form ID to array
    });

    res.status(201).send(evaluationForm);
  } catch (error) {
    res.status(400).send(error);
  }
}); 

// Get all evaluation forms
router.get('/',passport.authenticate('jwt',{session:false}), async (req, res) => {
  try {
    const evaluationForms = await EvaluationForm.find({programManager:req.user._id});
    res.send(evaluationForms);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update an evaluation form
router.put('/:id',passport.authenticate('jwt',{session:false}), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEvaluationForm = await EvaluationForm.findByIdAndUpdate(id, { ...req.body, lastModified: new Date().toLocaleDateString() }, { new: true });
    if (!updatedEvaluationForm) {
      return res.status(404).send({ message: 'Evaluation form not found' });
    }
    res.send(updatedEvaluationForm);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete an evaluation form
router.delete('/:id',passport.authenticate('jwt',{session:false}), async (req, res) => {
  console.log('Delete EVAL')
  try {
    const { id } = req.params;
    console.log(id)
    const deletedEvaluationForm = await EvaluationForm.findByIdAndDelete(id);
    if (!deletedEvaluationForm) {
      return res.status(404).send({ message: 'Evaluation form not found' });
    }
    await ProgramManager.findByIdAndUpdate(deletedEvaluationForm.programManager, {
      $pull: { evalForms: deletedEvaluationForm._id }, // Remove form ID from the `forms` array
    });

    res.send({ message: 'Evaluation form deleted successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
});

 

// Save form structure
router.post('/form-structure',passport.authenticate('jwt',{session:false})  ,async (req, res) => {
  const { id, title, fields } = req.body;
  try {
    const newFormStructure = new FormStructure({ id, title, fields });
    await newFormStructure.save();
    res.status(201).send(newFormStructure);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Update form structure
router.put('/form-structure/:id',passport.authenticate('jwt',{session:false}) ,async (req, res) => {
  const { id } = req.params;
  const { title, fields } = req.body;
  try {
    const updatedFormStructure = await FormStructure.findOneAndUpdate(
      { id },
      { title, fields, lastModified: new Date().toISOString() },
      { new: true }
    );
    if (!updatedFormStructure) {
      return res.status(404).send('Form not found');
    }
    res.status(200).send(updatedFormStructure);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Retrieve form structure
router.get('/form-structure/:id',passport.authenticate('jwt',{session:false}) ,async (req, res) => {
  try {
    const formStructure = await FormStructure.findOne({ id: req.params.id });
    if (formStructure) {
      res.status(200).send(formStructure);
    } else {
      res.status(404).send('Form not found');
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// Retrieve all form structures  //Currently not using.
router.get('/form-structure', async (req, res) => {
  try {
    const formStructures = await FormStructure.find();
    res.status(200).send(formStructures);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Save Shared Evaluator Form Routes
// Submit a shared evaluator form   
router.post('/shared-evaluator-form',passport.authenticate('jwt',{session:false}) ,async (req, res) => {
  try {
    const form = new SaveSharedEvaluatorForm(req.body);
    await form.save();
    res.status(201).send(form);
  } catch (error) {
    console.error('Error submitting shared evaluator form:', error);
    res.status(400).send(error.message);
  }
});

 
// Get a specific shared evaluator form by ID //Not using currently.
router.get('/shared-evaluator-form/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    const form = await SaveSharedEvaluatorForm.findById(id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    res.send(form);
  } catch (error) {
    console.error('Error fetching shared evaluator form:', error);
    res.status(500).send(error);
  }
});

module.exports = router;




 