import express from 'express'
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getMyCourses,
} from '../controllers/courseController.js'
import { createRequest, getCourseRequests } from '../controllers/requestController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.get('/', getCourses)
router.get('/:id', getCourseById)

// Protected routes
router.route('/')
  .post(protect, createCourse)

router.route('/my')
  .get(protect, getMyCourses)

router.route('/:id')
  .put(protect, updateCourse)
  .delete(protect, deleteCourse)

// Course request routes
router.route('/:id/requests')
  .post(protect, createRequest)
  .get(protect, getCourseRequests)

export default router