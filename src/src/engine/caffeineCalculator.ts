/**
 * Caffeine Metabolism Engine
 * Calculates caffeine levels over time using a customizable half-life curve
 */

export type CaffeineEvent = {
  datetime: string; // ISO format date string
  mg: number;       // Caffeine amount in milligrams
};

export type TimeSeriesData = {
  time: Date;       // Date object representing the point in time
  level: number;    // Caffeine level in mg at this time point
};

/**
 * Calculates remaining caffeine amount after a period of time based on half-life
 * @param initialAmount Initial caffeine amount in mg
 * @param hours Hours elapsed since consumption
 * @param halfLife Half-life of caffeine in hours (default: 6)
 * @returns Remaining caffeine amount in mg
 */
export const calculateRemainingCaffeine = (
  initialAmount: number, 
  hours: number, 
  halfLife: number = 6
): number => {
  if (hours <= 0) return initialAmount;
  
  // Caffeine decay formula: A(t) = A₀ * 0.5^(t/h)
  // Where A₀ is initial amount, t is time elapsed, h is half-life
  const decayFactor = Math.pow(0.5, hours / halfLife);
  return initialAmount * decayFactor;
};

/**
 * Computes caffeine levels over time based on intake events
 * @param events Array of caffeine intake events
 * @param now Current date and time
 * @param hours Number of hours to look back (default: 24)
 * @param resolution Resolution in minutes between data points (default: 60)
 * @param halfLife Half-life of caffeine in hours (default: 6)
 * @returns Array of time series data points showing caffeine level over time
 */
export const computeLevels = (
  events: CaffeineEvent[],
  now: Date = new Date(),
  hours: number = 24,
  resolution: number = 60,
  halfLife: number = 6
): TimeSeriesData[] => {
  // Validate inputs
  if (!events || events.length === 0) {
    return generateEmptyTimeSeries(now, hours, resolution);
  }

  // Sort events by datetime
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  // Calculate the start time (now - hours)
  const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
  
  // Filter events in the relevant time window (and a bit before to account for residual caffeine)
  // Include events from up to 24 hours before our display window starts to account for residual caffeine
  const relevantEvents = sortedEvents.filter(event => 
    new Date(event.datetime).getTime() > startTime.getTime() - 24 * 60 * 60 * 1000
  );

  // Generate time points at the specified resolution
  const timePoints: Date[] = [];
  for (let i = 0; i <= hours * 60; i += resolution) {
    const timePoint = new Date(startTime.getTime() + i * 60 * 1000);
    timePoints.push(timePoint);
  }

  // Calculate caffeine level at each time point
  const results: TimeSeriesData[] = timePoints.map(timePoint => {
    let totalLevel = 0;
    
    // Sum the contribution of each event
    for (const event of relevantEvents) {
      const eventTime = new Date(event.datetime);
      
      // Skip future events
      if (eventTime > timePoint) continue;
      
      // Calculate hours since this event
      const hoursSinceEvent = (timePoint.getTime() - eventTime.getTime()) / (1000 * 60 * 60);
      
      // Add the remaining caffeine from this event using the custom half-life
      totalLevel += calculateRemainingCaffeine(event.mg, hoursSinceEvent, halfLife);
    }
    
    return {
      time: timePoint,
      level: Math.round(totalLevel * 100) / 100, // Round to 2 decimal places
    };
  });

  return results;
};

/**
 * Generates an empty time series for when no events exist
 */
const generateEmptyTimeSeries = (
  now: Date,
  hours: number,
  resolution: number
): TimeSeriesData[] => {
  const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
  const results: TimeSeriesData[] = [];
  
  for (let i = 0; i <= hours * 60; i += resolution) {
    const timePoint = new Date(startTime.getTime() + i * 60 * 1000);
    results.push({
      time: timePoint,
      level: 0
    });
  }
  
  return results;
};