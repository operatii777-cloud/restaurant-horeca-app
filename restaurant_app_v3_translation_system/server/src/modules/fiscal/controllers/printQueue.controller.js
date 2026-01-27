/**
 * PHASE S7.3 - Print Queue Controller
 * 
 * Admin endpoints for managing fiscal print queue.
 */

const PrintJobsRepository = require('../repo/printJobs.repository');
const PrintQueueService = require('../services/printQueue.service');

class PrintQueueController {
  /**
   * GET /api/fiscal/print-jobs
   * List print jobs with optional filters
   */
  async getJobs(req, res, next) {
    try {
      const { status, limit } = req.query;
      
      const jobs = await PrintJobsRepository.listJobs({
        status: status || undefined,
        limit: limit ? parseInt(limit, 10) : 100
      });

      res.json({
        success: true,
        jobs,
        count: jobs.length
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/fiscal/print-jobs/:id
   * Get specific job by ID
   */
  async getJobById(req, res, next) {
    try {
      const { id } = req.params;
      const job = await PrintJobsRepository.getJobById(parseInt(id, 10));

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      res.json({
        success: true,
        job
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/fiscal/print-jobs/:id/retry
   * Requeue a failed job
   */
  async retryJob(req, res, next) {
    try {
      const { id } = req.params;
      const jobId = parseInt(id, 10);

      // Verify job exists
      const job = await PrintJobsRepository.getJobById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      // Requeue job
      await PrintJobsRepository.requeueJob(jobId);

      res.json({
        success: true,
        message: 'Job requeued successfully',
        jobId
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/fiscal/print-jobs/status
   * Get queue status
   */
  async getStatus(req, res, next) {
    try {
      const status = await PrintQueueService.getStatus();
      
      res.json({
        success: true,
        status
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PrintQueueController();

