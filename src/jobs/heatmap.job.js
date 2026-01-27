const HeatMapService = require('../services/heatmap.service');

class HeatMapJob {
  static async runHeatMapUpdate() {
    try {
      console.log(`[${new Date().toISOString()}] Starting HeatMap update job...`);
      
      const result = await HeatMapService.computeHeatMapForAllUsers();
      
      if (result.success) {
        console.log(`[${new Date().toISOString()}] HeatMap update completed successfully`);
        console.log(`Processed ${result.totalUsers} users`);
        
        result.results.forEach(userResult => {
          if (userResult.success) {
            console.log(`User ${userResult.userId}: ${userResult.topicsProcessed} topics processed`);
          } else {
            console.error(`User ${userResult.userId}: Failed - ${userResult.error}`);
          }
        });
      } else {
        console.error(`[${new Date().toISOString()}] HeatMap update failed: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] HeatMap job error:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async runHeatMapUpdateForUser(userId) {
    try {
      console.log(`[${new Date().toISOString()}] Starting HeatMap update for user ${userId}...`);
      
      const result = await HeatMapService.computeHeatMapForUser(userId);
      
      if (result.success) {
        console.log(`[${new Date().toISOString()}] HeatMap update completed for user ${userId}`);
        console.log(`Processed ${result.topicsProcessed} topics`);
      } else {
        console.error(`[${new Date().toISOString()}] HeatMap update failed for user ${userId}: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] HeatMap job error for user ${userId}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Simple interval-based scheduler (for V1)
  static startScheduler(intervalHours = 6) {
    const intervalMs = intervalHours * 60 * 60 * 1000; // Convert hours to milliseconds
    
    console.log(`Starting HeatMap scheduler to run every ${intervalHours} hours`);
    
    // Run immediately on start
    this.runHeatMapUpdate();
    
    // Then run at regular intervals
    setInterval(async () => {
      await this.runHeatMapUpdate();
    }, intervalMs);
  }

  // Manual trigger for testing
  static triggerUpdate() {
    console.log('Manually triggering HeatMap update...');
    return this.runHeatMapUpdate();
  }
}

module.exports = HeatMapJob;