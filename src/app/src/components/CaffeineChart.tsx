import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts';
import { TimeSeriesData, calculateRemainingCaffeine } from '../engine/caffeineCalculator';
import CurrentCaffeineDonut from './CurrentCaffeineDonut';
import CaffeineHealthInfo from './CaffeineHealthInfo';
import { Card, Row, Col, Container, ButtonGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons';

interface CaffeineChartProps {
  data: TimeSeriesData[];
  maxSafeLevel: number;
  sleepThreshold: number;
  sleepStartHour: number;
  halfLifeHours: number;
  currentTime?: Date; // Actual "now" time
  includeFutureIntakes?: boolean; // Whether to include future caffeine intakes
}

// Define interfaces for tooltip payload
interface TooltipPayload {
  value: number | null;
  dataKey: string;
}

// Define custom tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
}

// Define zoom levels in hours (how many hours before and after "now")
type ZoomLevel = {
  pastHours: number;
  futureHours: number;
};

// Helper function to format time span for display
const formatTimeSpan = (hours: number): string => {
  if (hours < 24) {
    return `${hours}h`;
  } else {
    const days = hours / 24;
    return days % 1 === 0 ? `${days}d` : `${days.toFixed(1)}d`;
  }
};

// Generate zoom levels in 12-hour increments up to 7 days (84 hours past, 84 hours future)
const generateZoomLevels = (): ZoomLevel[] => {
  const levels: ZoomLevel[] = [];
  for (let hours = 12; hours <= 84; hours += 12) {
    levels.push({ pastHours: hours, futureHours: hours });
  }
  return levels;
};

const ZOOM_LEVELS: ZoomLevel[] = generateZoomLevels();

const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MOBILE_BREAKPOINT = 768; // Bootstrap md breakpoint

/**
 * CaffeineChart component displaying caffeine levels with visualizations
 * This component renders current levels with a donut chart, historical data 
 * with an area chart, and health information in cards.
 */
const CaffeineChart: React.FC<CaffeineChartProps> = ({ 
  data, 
  maxSafeLevel,
  sleepThreshold,
  sleepStartHour,
  halfLifeHours,
  currentTime,
  includeFutureIntakes = true // Default to including future intakes
}) => {
  // State for current zoom level
  const [currentZoomIndex, setCurrentZoomIndex] = useState<number>(0);
  
  // Determine if we're on a small screen device
  const [viewportWidth, setViewportWidth] = useState<number>(window.innerWidth);
  const isMobile = useMemo(() => viewportWidth < MOBILE_BREAKPOINT, [viewportWidth]);

  // For window resize handler
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use provided currentTime or create a new Date - this will be reactive to props changes
  const now = useMemo(() => currentTime || new Date(), [currentTime]);
  
  // Zoom in function - decrease visible time range
  const handleZoomIn = useCallback(() => {
    setCurrentZoomIndex(prev => Math.max(0, prev - 1));
  }, []);
  
  // Zoom out function - increase visible time range
  const handleZoomOut = useCallback(() => {
    setCurrentZoomIndex(prev => Math.min(ZOOM_LEVELS.length - 1, prev + 1));
  }, []);
  
  // Calculate chart boundaries based on current zoom level
  const chartBoundaries = useMemo(() => {
    const zoomLevel = ZOOM_LEVELS[currentZoomIndex];
    
    const startTime = new Date(now);
    startTime.setHours(startTime.getHours() - zoomLevel.pastHours);
    
    const endTime = new Date(now);
    endTime.setHours(endTime.getHours() + zoomLevel.futureHours);
    
    return {
      startTime,
      endTime
    };
  }, [now, currentZoomIndex]);
  
  // Format date for day boundary labels
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString([], { 
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  }, []);

  // Use responsive labels based on screen size
  const labels = useMemo(() => ({
    maxSafe: isMobile ? "Max Safe" : "Maximum Safe Daily Intake (400mg)",
    sleepThreshold: isMobile ? "Sleep Wellness" : "Sleep Disruption Threshold (100mg)",
    sleepTime: isMobile ? "Bedtime" : "Bedtime",
    now: isMobile ? "Now" : "Now",
    halfLife: isMobile ? `${halfLifeHours}h Half-Life` : `Based on ${halfLifeHours}-hour Half-Life`
  }), [isMobile, halfLifeHours]);

  // Format time for labels
  const formatCurrentTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Format time labels for the chart
  const getNowLabel = useCallback(() => `${labels.now}: ${formatCurrentTime(now)}`, [labels.now, formatCurrentTime, now]);
  //const getSleepLabel = useCallback((sleepStart: Date) => `${labels.sleepTime}: ${formatCurrentTime(sleepStart)}`, [labels.sleepTime, formatCurrentTime]);
  const getSleepLabel = useCallback(() => 'Bedtime', [labels.now, formatCurrentTime, now]);

  // Get current caffeine level (most recent data point not in the future)
  const currentCaffeineLevel = useMemo(() => {
    if (!data || data.length === 0) return 0;
    
    const currentData = data.filter(point => point.time <= now);
    if (currentData.length === 0) return 0;
    
    const currentPoint = currentData[currentData.length - 1];
    return currentPoint.level;
  }, [data, now]);

  // Separate real caffeine data into past and future intakes
  const { pastIntakes, futureIntakes } = useMemo(() => {
    if (!data || data.length === 0) return { pastIntakes: [], futureIntakes: [] };
    
    return {
      pastIntakes: data.filter(point => point.time <= now),
      futureIntakes: data.filter(point => point.time > now)
    };
  }, [data, now]);

  // Generate projected caffeine decay data for the future
  const projectedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Get the current caffeine level (most recent data point not in the future)
    const currentData = data.filter(point => point.time <= now);
    if (currentData.length === 0) return [];
    
    const currentPoint = currentData[currentData.length - 1];
    const currentLevel = currentPoint.level;
    
    if (currentLevel <= 0) return [];
    
    // Project into the future for 48 hours
    const endTime = new Date(now);
    endTime.setHours(endTime.getHours() + ZOOM_LEVELS[ZOOM_LEVELS.length - 1].futureHours);
    
    const projections: TimeSeriesData[] = [];
    const totalMinutes = (endTime.getTime() - now.getTime()) / (60 * 1000);
    
    // Generate projection points every 30 minutes
    for (let i = 0; i <= totalMinutes / 30; i++) {
      const futureTime = new Date(now.getTime() + i * 30 * 60 * 1000);
      const hoursSinceNow = i / 2; // Convert 30-min intervals to hours
      const projectedLevel = calculateRemainingCaffeine(currentLevel, hoursSinceNow, halfLifeHours);
      
      projections.push({
        time: futureTime,
        level: Math.round(projectedLevel * 100) / 100
      });
    }
    
    return projections;
  }, [data, now, halfLifeHours]);

  // If including future intakes, combine them with the projected data
  const combinedFutureData = useMemo(() => {
    if (!includeFutureIntakes || futureIntakes.length === 0) {
      return projectedData;
    }
    
    // Make a shallow copy of projected data
    const result = [...projectedData];
    
    // For each future intake, adjust the projected levels
    futureIntakes.forEach(intake => {
      // Adjust all projection points that occur after this intake
      for (let i = 0; i < result.length; i++) {
        const projectionPoint = result[i];
        
        // Skip points that are before this intake
        if (projectionPoint.time < intake.time) continue;
        
        // For points at or after the intake, add the caffeine amount
        // and recalculate the decay from that point
        const hoursSinceIntake = (projectionPoint.time.getTime() - intake.time.getTime()) / (60 * 60 * 1000);
        // Decay the intake amount based on time since intake
        const additionalCaffeine = calculateRemainingCaffeine(intake.level, hoursSinceIntake, halfLifeHours);
        
        // Add the additional caffeine to the projected level
        projectionPoint.level += additionalCaffeine;
        // Round to two decimal places
        projectionPoint.level = Math.round(projectionPoint.level * 100) / 100;
      }
    });
    
    return result;
  }, [projectedData, futureIntakes, includeFutureIntakes, halfLifeHours]);

  // Create combined data for chart display
  const combinedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Past data (actual intake)
    const pastData = pastIntakes.map(item => ({
      time: item.time.getTime(), // Convert to timestamp
      actualLevel: item.level,
      projectedLevel: null as number | null,
      futureLevel: null as number | null
    }));
    
    // Future projection data
    const futureData = combinedFutureData.map(item => ({
      time: item.time.getTime(),
      actualLevel: null as number | null,
      projectedLevel: item.level,
      futureLevel: null as number | null
    }));
    
    // Future actual intakes (if any and if includeFutureIntakes is true)
    const futurePlannedData = includeFutureIntakes ? futureIntakes.map(item => ({
      time: item.time.getTime(),
      actualLevel: null as number | null,
      projectedLevel: null as number | null,
      futureLevel: item.level
    })) : [];

    // Add the current point to both datasets to ensure continuity
    if (pastData.length > 0) {
      const lastActualPoint = {...pastData[pastData.length - 1]};
      futureData.unshift({
        time: lastActualPoint.time,
        actualLevel: lastActualPoint.actualLevel,
        projectedLevel: lastActualPoint.actualLevel,
        futureLevel: null
      });
    }

    return [...pastData, ...futureData, ...futurePlannedData].sort((a, b) => a.time - b.time);
  }, [pastIntakes, combinedFutureData, futureIntakes, includeFutureIntakes]);

  // Format X-axis timestamps
  const formatXAxis = useCallback((timeValue: number) => {
    const date = new Date(timeValue);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Generate day boundaries for clear day separation
  const dayBoundaries = useMemo(() => {
    const boundaries: Date[] = [];
    const start = new Date(chartBoundaries.startTime);
    const end = new Date(chartBoundaries.endTime);
    
    // Start from the beginning of the day containing the start time
    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    
    // Add each day boundary
    for (let day = new Date(dayStart); day <= end; day.setDate(day.getDate() + 1)) {
      boundaries.push(new Date(day));
    }
    
    return boundaries;
  }, [chartBoundaries]);

  // Generate sleep time goals for all days in view
  const sleepTimes = useMemo(() => {
    const sleepMarkers: Date[] = [];
    const start = new Date(chartBoundaries.startTime);
    const end = new Date(chartBoundaries.endTime);
    
    // Start from the beginning of the day containing the start time
    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    
    // Add sleep time for each day
    for (let day = new Date(dayStart); day <= end; day.setDate(day.getDate() + 1)) {
      const sleepTime = new Date(day);
      sleepTime.setHours(sleepStartHour, 0, 0, 0);
      
      // If sleep time is early morning (e.g., 2AM), it belongs to the next day
      if (sleepStartHour < 12) {
        sleepTime.setDate(sleepTime.getDate() + 1);
      }
      
      // Only add if within our chart boundaries
      if (sleepTime >= start && sleepTime <= end) {
        sleepMarkers.push(new Date(sleepTime));
      }
    }
    
    return sleepMarkers;
  }, [chartBoundaries, sleepStartHour]);

  // Generate hour markers for all days in the view window
  const hourMarkers = useMemo(() => {
    const markers: number[] = [];
    const start = new Date(chartBoundaries.startTime);
    const end = new Date(chartBoundaries.endTime);
    
    // Start with the beginning of the day containing start time
    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    
    // Add markers for each day in view
    for (let day = new Date(dayStart); day <= end; day.setDate(day.getDate() + 1)) {
      // Add markers at 00:00, 06:00, 12:00, and 18:00
      [0, 6, 12, 18].forEach(hour => {
        const marker = new Date(day);
        marker.setHours(hour, 0, 0, 0);
        
        // Only add if within our chart boundaries
        if (marker >= start && marker <= end) {
          markers.push(marker.getTime());
        }
      });
    }
    
    return markers;
  }, [chartBoundaries]);

  // Find max level for proper y-axis scale
  const maxLevel = useMemo(() => {
    if (!data || data.length === 0) return maxSafeLevel;
    
    const allLevels = [
      ...data.map(item => item.level),
      ...combinedFutureData.map(item => item.level),
      maxSafeLevel
    ];
    
    return Math.max(...allLevels);
  }, [data, combinedFutureData, maxSafeLevel]);

  // Create chart margins with reduced space to maximize visible chart area
  const chartMargins = useMemo(() => ({
    top: 30,      // Reduced from 40
    right: 10,    // Reduced from 30
    left: 5,      // Reduced from 10
    bottom: 5    // Reduced from 70
  }), []);

  // Custom tooltip component
  const CustomTooltip = useCallback(({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      // Find the payload item that has a non-null value
      const dataPoint = payload.find((p: TooltipPayload) => p.value !== null);
      if (!dataPoint) return null;
      
      const caffeine = dataPoint.value;
      const isProjected = dataPoint.dataKey === 'projectedLevel';
      const isFuture = dataPoint.dataKey === 'futureLevel';
      
      const pointTime = new Date(label as number);
      const timeStr = pointTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const dateStr = pointTime.toLocaleDateString([], { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      });
      
      return (
        <div className="custom-tooltip p-2 bg-light border rounded shadow">
          <p className="mb-1">
            <strong>{dateStr}</strong> at <strong>{timeStr}</strong>
          </p>
          <p className="mb-0">
            {isFuture ? "Planned Intake: " : isProjected ? "Projected Caffeine: " : "Caffeine Level: "}
            <strong>{caffeine} mg</strong>
          </p>
          {isProjected && <p className="mb-0 small text-muted">({labels.halfLife})</p>}
          {isFuture && <p className="mb-0 small text-muted">(Planned future intake)</p>}
        </div>
      );
    }
    return null;
  }, [labels.halfLife]);

  // Early return for no data case
  if (!data || data.length === 0) {
    return (
      <Container fluid className="p-0">
        <div className="text-center p-5 bg-light rounded">
          <p>No caffeine intake data available. Add caffeine to see the chart.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="caffeine-dashboard p-0">
      <Row className="g-3">
        {/* Section 1: Current Caffeine Level - Stack on mobile, side-by-side on larger screens */}
        <Col lg={4} xl={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <CurrentCaffeineDonut 
                currentLevel={currentCaffeineLevel}
                maxSafeLevel={maxSafeLevel}
                sleepThreshold={sleepThreshold}
                halfLifeHours={halfLifeHours}
              />
            </Card.Body>
          </Card>
        </Col>
        
        {/* Column for sections 2 & 3 stacked vertically */}
        <Col lg={8} xl={9}>
          {/* Section 2: Caffeine Levels Over Time */}
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h3 className="mb-0">
                  <FontAwesomeIcon icon={faCalendarDay} className="me-2" />
                  
                  <span className="d-none d-md-inline">Caffeine </span>
                  <span className="d-none d-lg-inline">Levels </span>
                  <span>Over Time</span>
                </h3>
                
                {/* Zoom controls */}
                <ButtonGroup>
                  <Button 
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={currentZoomIndex === 0}
                    title="Zoom in (show less time)"
                  >
                    <FontAwesomeIcon icon={faSearchPlus} />
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    size="sm"
                    className="px-2"
                    disabled
                  >
                    {formatTimeSpan(ZOOM_LEVELS[currentZoomIndex].pastHours + ZOOM_LEVELS[currentZoomIndex].futureHours)}
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={currentZoomIndex === ZOOM_LEVELS.length - 1}
                    title="Zoom out (show more time)"
                  >
                    <FontAwesomeIcon icon={faSearchMinus} />
                  </Button>
                </ButtonGroup>
              </div>
              
              <div 
                style={{ width: '100%', height: 350 }}
                className="chart-container"
              >
                <ResponsiveContainer>
                  <AreaChart
                    data={combinedData}
                    margin={chartMargins}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={formatXAxis}
                      type="number"
                      domain={[chartBoundaries.startTime.getTime(), chartBoundaries.endTime.getTime()]}
                      ticks={hourMarkers}
                      padding={{ left: 10, right: 10 }}
                      tick={{ fontSize: 10 }}
                      allowDataOverflow
                      scale="time"
                    />
                    <YAxis 
                      domain={[0, Math.ceil(maxLevel * 1.1 / 50) * 50]} 
                      padding={{ top: 10, bottom: 0 }}
                      tick={{ fontSize: 9 }}
                      width={25}
                    />
                    <RechartsTooltip 
                      content={(props: any) => CustomTooltip({
                        active: props.active,
                        payload: props.payload,
                        label: props.label
                      })} 
                    />
                    
                    {/* Day boundary markers with clear positioning below time labels */}
                    {dayBoundaries.map((day, index) => (
                      <ReferenceLine 
                        key={`day-${index}`}
                        x={day.getTime()} 
                        stroke="#6c757d" 
                        strokeWidth={1}
                        strokeDasharray="5 5" 
                        label={{
                          value: formatDate(day),
                          position: 'insideBottom',
                          fill: '#6c757d',
                          fontSize: 10, // Reduced from 11
                          dy: 25, // Reduced from 35
                          offset: 0
                        }}
                      />
                    ))}
                    
                    {/* Max safe level */}
                    <ReferenceLine 
                      y={maxSafeLevel} 
                      stroke="red" 
                      strokeDasharray="3 3" 
                    >
                      <Label 
                        value={labels.maxSafe}
                        position="insideBottomLeft"
                        fill="red"
                        fontSize={10} // Reduced from 12
                        offset={3} // Reduced from 5
                      />
                    </ReferenceLine>
                    
                    {/* Sleep threshold */}
                    <ReferenceLine 
                      y={sleepThreshold} 
                      stroke="#FFA500" 
                      strokeDasharray="3 3" 
                    >
                      <Label 
                        value={labels.sleepThreshold}
                        position="insideBottomLeft"
                        fill="#FFA500"
                        fontSize={10} // Reduced from 12
                        offset={3} // Reduced from 5
                      />
                    </ReferenceLine>
                    
                    {/* Sleep time markers for all days in view */}
                    {sleepTimes.map((sleepTime, index) => (
                      <ReferenceLine 
                        key={`sleep-${index}`}
                        x={sleepTime.getTime()} 
                        stroke="#6610f2" 
                        strokeWidth={1}
                        strokeDasharray="3 3" 
                        label={{
                          value: getSleepLabel(sleepTime),
                          position: 'top',
                          fill: '#6610f2',
                          fontSize: 10, // Reduced from 12
                          offset: 10 // Reduced from 15
                        }}
                      />
                    ))}
                    
                    {/* Current time marker */}
                    <ReferenceLine 
                      x={now.getTime()} 
                      stroke="#28a745" 
                      strokeWidth={2}
                      label={{
                        value: getNowLabel(),
                        position: 'insideTopRight',
                        fill: '#28a745',
                        fontSize: 12,
                        offset: 5
                      }}
                    />
                    
                    {/* Actual caffeine data (solid) */}
                    <Area 
                      type="monotone" 
                      dataKey="actualLevel" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6} 
                      isAnimationActive={false}
                      name="Actual Caffeine Level" 
                      connectNulls={true}
                    />
                    
                    {/* Projected caffeine data */}
                    <Area 
                      type="monotone" 
                      dataKey="projectedLevel" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.3}
                      strokeDasharray="5 5"
                      isAnimationActive={false}
                      name="Projected Caffeine Level"
                      connectNulls={true}
                    />
                    
                    {/* Future planned intakes */}
                    {includeFutureIntakes && (
                      <Area 
                        type="monotone" 
                        dataKey="futureLevel" 
                        stroke="#ff7300" 
                        fill="#ff7300" 
                        fillOpacity={0.6}
                        isAnimationActive={false}
                        name="Future Planned Intake"
                        connectNulls={true}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 d-flex flex-wrap justify-content-between align-items-center">
                <small className="text-muted">
                  * Dotted green area shows projected caffeine decay {labels.halfLife}
                </small>
                {includeFutureIntakes && futureIntakes.length > 0 && (
                  <small className="text-muted">
                    * Orange spikes show planned future intakes
                  </small>
                )}
                <small className="text-muted">
                  {isMobile ? "Pinch to zoom" : "Use zoom controls to adjust time range"}
                </small>
              </div>
            </Card.Body>
          </Card>
          
          {/* Section 3: Health Information */}
          <Card className="shadow-sm">
            <Card.Body>
              <CaffeineHealthInfo
                currentLevel={currentCaffeineLevel}
                maxSafeLevel={maxSafeLevel}
                sleepThreshold={sleepThreshold}
                halfLifeHours={halfLifeHours}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CaffeineChart;