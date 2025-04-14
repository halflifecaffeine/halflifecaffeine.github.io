import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
import { Card, Row, Col, Container, Button, ButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarDay } from '@fortawesome/free-solid-svg-icons';

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

// Constants for time navigation
const HOURS_VISIBLE = 18; // Total hours visible in chart (default: -6h to +12h = 18h)
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Define breakpoint for responsive design
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
  // State for chart viewport/navigation
  const [timeOffset, setTimeOffset] = useState<number>(0); // Offset in days (0 = today)
  
  // State to track viewport width for responsive labels
  const [viewportWidth, setViewportWidth] = useState<number>(window.innerWidth);
  
  // Effect to handle viewport size changes
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Handle swipe gestures for mobile scrolling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchDelta = touchStart - e.touches[0].clientX;
    // Threshold to trigger navigation (50px)
    if (Math.abs(touchDelta) > 50) {
      // Navigate left/right based on swipe direction
      setTimeOffset(prev => prev + (touchDelta > 0 ? 1 : -1));
      setTouchStart(null); // Reset to prevent continuous scrolling
    }
  }, [touchStart]);
  
  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
  }, []);
  
  // Handle navigation buttons
  const navigateTime = useCallback((direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setTimeOffset(0);
    } else {
      setTimeOffset(prev => prev + (direction === 'next' ? 1 : -1));
    }
  }, []);
  
  // Determine if we're on a small screen device
  const isMobile = useMemo(() => viewportWidth < MOBILE_BREAKPOINT, [viewportWidth]);

  // Use provided currentTime or create a new Date - this will be reactive to props changes
  const now = useMemo(() => currentTime || new Date(), [currentTime]);
  
  // Calculate the visible time window based on offset
  const timeCalculations = useMemo(() => {
    const offsetMs = timeOffset * ONE_DAY_MS;
    
    // Chart center time (adjusted by offset)
    const centerTime = new Date(now.getTime() + offsetMs);
    
    // Chart boundaries - ensure we see 24 hours regardless of navigation
    const startOfDay = new Date(centerTime);
    startOfDay.setHours(0, 0, 0, 0);  // Start at beginning of the day
    
    // Chart boundaries for the current day being viewed
    const windowStartTime = new Date(startOfDay);
    const windowEndTime = new Date(startOfDay);
    windowEndTime.setHours(24, 0, 0, 0);  // Show full 24 hours
    
    // Calculate day boundaries and sleep times for each visible day
    const dayBoundaries: Date[] = [];
    const sleepStartTimes: Date[] = [];
    
    // Add day boundaries (always 2 - start and end of window)
    dayBoundaries.push(new Date(startOfDay));  // Start of day
    
    const nextDay = new Date(startOfDay);
    nextDay.setDate(nextDay.getDate() + 1);
    dayBoundaries.push(new Date(nextDay));  // Start of next day
    
    // Add sleep time for the current day
    const sleepStartCurrent = new Date(startOfDay);
    sleepStartCurrent.setHours(sleepStartHour, 0, 0, 0);
    
    // If sleep time is earlier than noon, it means it's for the next day
    if (sleepStartHour < 12) {
      sleepStartCurrent.setDate(sleepStartCurrent.getDate() + 1);
    }
    
    sleepStartTimes.push(sleepStartCurrent);
    
    return { 
      windowStartTime, 
      windowEndTime, 
      sleepStartTimes,
      dayBoundaries,
      startOfDay
    };
  }, [now, timeOffset, sleepStartHour]);
  
  const { windowStartTime, windowEndTime, sleepStartTimes, dayBoundaries, startOfDay } = timeCalculations;

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
    sleepThreshold: isMobile ? "Sleep Well" : "Sleep Disruption Threshold (100mg)",
    sleepTime: isMobile ? "Bedtime" : "Sleep Time Goal",
    now: isMobile ? "Now" : "Now",
    halfLife: isMobile ? `${halfLifeHours}h Half-Life` : `Based on ${halfLifeHours}-hour Half-Life`,
    today: "Today",
    dayBoundary: isMobile ? "" : "New Day"
  }), [isMobile, halfLifeHours]);

  // Format time for labels
  const formatCurrentTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Format time labels for the chart
  const getNowLabel = useCallback(() => `${labels.now}: ${formatCurrentTime(now)}`, [labels.now, formatCurrentTime, now]);
  const getSleepLabel = useCallback((sleepStart: Date) => `${labels.sleepTime}: ${formatCurrentTime(sleepStart)}`, [labels.sleepTime, formatCurrentTime]);
  
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
    
    // Extend projections to cover the visible window plus extra for scrolling
    const endTime = new Date(Math.max(
      windowEndTime.getTime(), 
      now.getTime() + 24 * 60 * 60 * 1000
    ));
    
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
  }, [data, now, halfLifeHours, windowEndTime]);

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

  // Generate fixed hour markers (00, 06, 12, 18) for all visible days (past, present, and future)
  const generateFixedTimeMarkers = useCallback(() => {
    const markers: number[] = [];
    
    // Generate markers for previous day as well to ensure past days have markers
    const prevDay = new Date(startOfDay);
    prevDay.setDate(prevDay.getDate() - 1);
    
    // Add markers for previous day (00:00, 06:00, 12:00, 18:00)
    [0, 6, 12, 18].forEach(hour => {
      const marker = new Date(prevDay);
      marker.setHours(hour, 0, 0, 0);
      markers.push(marker.getTime());
    });
    
    // Generate markers for the current day being viewed
    const currentDay = new Date(startOfDay);
    
    // Add markers at 00:00, 06:00, 12:00, 18:00 for the current day
    [0, 6, 12, 18].forEach(hour => {
      const marker = new Date(currentDay);
      marker.setHours(hour, 0, 0, 0);
      markers.push(marker.getTime());
    });
    
    // Add markers for the next day as well to ensure future days have markers
    const nextDay = new Date(currentDay);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Add markers for the next day (00:00, 06:00, 12:00, 18:00)
    [0, 6, 12, 18].forEach(hour => {
      const marker = new Date(nextDay);
      marker.setHours(hour, 0, 0, 0);
      markers.push(marker.getTime());
    });
    
    return markers;
  }, [startOfDay]);
  
  // Generate fixed time markers for the chart
  const fixedTimeMarkers = useMemo(generateFixedTimeMarkers, [generateFixedTimeMarkers]);

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

  // Create chart margins with extra space for labels at top and bottom
  const chartMargins = useMemo(() => ({
    top: 40,  // For labels above chart
    right: 30,
    left: 10, 
    bottom: 70  // Further increased for better day label separation
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

  // Get the current day being viewed
  const currentViewDay = formatDate(startOfDay);

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
                  Caffeine Levels Over Time
                </h3>
                
                {/* Chart navigation controls */}
                <ButtonGroup>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={() => navigateTime('prev')}
                    title="View earlier time"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </Button>
                  
                  {timeOffset !== 0 && (
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => navigateTime('today')}
                      title="Return to current time"
                    >
                      <FontAwesomeIcon icon={faCalendarDay} className="me-1" />
                      {labels.today}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={() => navigateTime('next')}
                    title="View later time"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </Button>
                </ButtonGroup>
              </div>
              
              <div 
                style={{ width: '100%', height: 350 }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
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
                      domain={[windowStartTime.getTime(), windowEndTime.getTime()]}
                      ticks={fixedTimeMarkers}
                      tick={{ fontSize: 10 }}
                      padding={{ left: 10, right: 10 }}
                                          />
                    <YAxis 
                      domain={[0, Math.ceil(maxLevel * 1.1 / 50) * 50]} 
                      padding={{ top: 15, bottom: 5 }}
                    />
                    <RechartsTooltip 
                      content={(props: any) => CustomTooltip({
                        active: props.active,
                        payload: props.payload,
                        label: props.label
                      })} 
                    />
                    
                    {/* Day boundary markers with clear positioning well below time labels */}
                    {dayBoundaries.map((day, index) => (
                      <ReferenceLine 
                        key={`day-${index}`}
                        x={day.getTime()} 
                        stroke="#6c757d" 
                        strokeWidth={1}
                        strokeDasharray="5 5" 
                        label={{
                          value: index === 0 ? formatDate(day) : "Next Day",
                          position: 'bottom',
                          fill: '#6c757d',
                          fontSize: 12,
                          dy: 25, // Significantly increased to position well below time markers
                          offset: 0
                        }}
                      />
                    ))}
                    
                    {/* Max safe level - with responsive label text and original positioning */}
                    <ReferenceLine 
                      y={maxSafeLevel} 
                      stroke="red" 
                      strokeDasharray="3 3" 
                    >
                      <Label 
                        value={labels.maxSafe}
                        position="insideBottomLeft"
                        fill="red"
                        fontSize={12}
                        offset={5}
                      />
                    </ReferenceLine>
                    
                    {/* Sleep threshold - with responsive label text and original positioning */}
                    <ReferenceLine 
                      y={sleepThreshold} 
                      stroke="#FFA500" 
                      strokeDasharray="3 3" 
                    >
                      <Label 
                        value={labels.sleepThreshold}
                        position="insideBottomLeft"
                        fill="#FFA500"
                        fontSize={12}
                        offset={5}
                      />
                    </ReferenceLine>
                    
                    {/* Sleep time markers - always show for the current day */}
                    {sleepStartTimes.map((sleepStart, index) => (
                      <ReferenceLine 
                        key={`sleep-${index}`}
                        x={sleepStart.getTime()} 
                        stroke="#6610f2" 
                        strokeWidth={timeOffset !== 0 ? 2 : 1}
                        strokeDasharray="3 3" 
                        label={{
                          value: getSleepLabel(sleepStart),
                          position: 'top',
                          fill: '#6610f2',
                          fontSize: 12,
                          fontWeight: timeOffset !== 0 ? 'bold' : 'normal',
                          offset: 15
                        }}
                      />
                    ))}
                    
                    {/* Current time marker - always show regardless of navigation */}
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
                  {isMobile ? "Swipe to navigate between days" : "Use the arrows to navigate between days"}
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