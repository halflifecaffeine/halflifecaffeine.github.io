import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Label,
  TooltipProps
} from 'recharts';
import { TimeSeriesData, calculateRemainingCaffeine } from '../engine/caffeineCalculator';
import CurrentCaffeineDonut from './CurrentCaffeineDonut';
import CaffeineHealthInfo from './CaffeineHealthInfo';
import { Card, Row, Col, Container } from 'react-bootstrap';

interface CaffeineChartProps {
  data: TimeSeriesData[];
  maxSafeLevel: number;
  sleepThreshold: number;
  sleepStartHour: number;
  halfLifeHours: number;
  currentTime?: Date; // Add optional prop to pass in current time
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
  currentTime
}) => {
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
  
  // Determine if we're on a small screen device
  const isMobile = useMemo(() => viewportWidth < MOBILE_BREAKPOINT, [viewportWidth]);

  // Use provided currentTime or create a new Date - this will be reactive to props changes
  const now = useMemo(() => currentTime || new Date(), [currentTime]);
  
  const timeCalculations = useMemo(() => {
    const sixHoursBefore = new Date(now.getTime() - (6 * 60 * 60 * 1000));
    const twelveHoursAhead = new Date(now.getTime() + (12 * 60 * 60 * 1000));
    
    // Calculate sleep start time
    const sleepStart = new Date(now);
    sleepStart.setHours(sleepStartHour, 0, 0, 0);
    
    // If sleep time is in the past, move it to tomorrow
    if (sleepStart < now) {
      sleepStart.setDate(sleepStart.getDate() + 1);
    }
    
    return { sixHoursBefore, twelveHoursAhead, sleepStart };
  }, [now, sleepStartHour]);
  
  const { sixHoursBefore, twelveHoursAhead, sleepStart } = timeCalculations;

  // Use responsive labels based on screen size
  const labels = useMemo(() => ({
    maxSafe: isMobile ? "Max Safe" : "Maximum Safe Daily Intake (400mg)",
    sleepThreshold: isMobile ? "Sleep Well" : "Sleep Disruption Threshold (100mg)",
    sleepTime: isMobile ? "Bedtime" : "Sleep Time Goal",
    now: isMobile ? "Now" : "Now",
    halfLife: isMobile ? `${halfLifeHours}h Half-Life` : `Based on ${halfLifeHours}-hour Half-Life`
  }), [isMobile, halfLifeHours]);

  // Get current caffeine level (most recent data point not in the future)
  const currentCaffeineLevel = useMemo(() => {
    if (!data || data.length === 0) return 0;
    
    const currentData = data.filter(point => point.time <= now);
    if (currentData.length === 0) return 0;
    
    const currentPoint = currentData[currentData.length - 1];
    return currentPoint.level;
  }, [data, now]);

  // Format time for labels
  const formatCurrentTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Format time labels for the chart
  const getNowLabel = useCallback(() => `${labels.now}: ${formatCurrentTime(now)}`, [labels.now, formatCurrentTime, now]);
  const getSleepLabel = useCallback(() => `${labels.sleepTime}: ${formatCurrentTime(sleepStart)}`, [labels.sleepTime, formatCurrentTime, sleepStart]);

  // Generate projected caffeine decay data for the future
  const projectedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Get the current caffeine level (most recent data point not in the future)
    const currentData = data.filter(point => point.time <= now);
    if (currentData.length === 0) return [];
    
    const currentPoint = currentData[currentData.length - 1];
    const currentLevel = currentPoint.level;
    
    if (currentLevel <= 0) return [];
    
    const projections: TimeSeriesData[] = [];
    // Generate projection points every 30 minutes
    for (let i = 0; i <= 24; i++) { // 12 hours, 2 points per hour
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

  // Create combined data for chart display
  const combinedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Past data (actual intake)
    const pastData = data.filter(point => point.time <= now).map(item => ({
      time: item.time.getTime(), // Convert to timestamp
      actualLevel: item.level,
      projectedLevel: null as number | null
    }));
    
    // Future data (projected decay)
    const futureData = projectedData.map(item => ({
      time: item.time.getTime(),
      actualLevel: null as number | null,
      projectedLevel: item.level
    }));

    // Add the current point to both datasets to ensure continuity
    if (pastData.length > 0) {
      const lastActualPoint = {...pastData[pastData.length - 1]};
      futureData.unshift({
        time: lastActualPoint.time,
        actualLevel: lastActualPoint.actualLevel,
        projectedLevel: lastActualPoint.actualLevel // Start projection from the current level
      });
    }

    return [...pastData, ...futureData];
  }, [data, projectedData, now]);

  // Format X-axis timestamps
  const formatXAxis = useCallback((timeValue: number) => {
    const date = new Date(timeValue);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Find max level for proper y-axis scale
  const maxLevel = useMemo(() => {
    if (!data || data.length === 0) return maxSafeLevel;
    
    return Math.max(
      ...data.map(item => item.level),
      ...projectedData.map(item => item.level),
      maxSafeLevel
    );
  }, [data, projectedData, maxSafeLevel]);

  // Create chart margins with extra space for labels at top
  const chartMargins = useMemo(() => ({
    top: 40,  // Increased for labels above chart
    right: 30,
    left: 10, 
    bottom: 10
  }), []);

  // Custom tooltip component
  const CustomTooltip = useCallback(({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      // Find the payload item that has a non-null value
      const dataPoint = payload.find((p: TooltipPayload) => p.value !== null);
      if (!dataPoint) return null;
      
      const caffeine = dataPoint.value;
      const isProjected = dataPoint.dataKey === 'projectedLevel';
      
      return (
        <div className="custom-tooltip p-2 bg-light border rounded shadow">
          <p className="mb-1"><strong>{formatXAxis(label as number)}</strong></p>
          <p className="mb-0">
            {isProjected ? "Projected Caffeine: " : "Caffeine Level: "}
            <strong>{caffeine} mg</strong>
          </p>
          {isProjected && <p className="mb-0 small text-muted">({labels.halfLife})</p>}
        </div>
      );
    }
    return null;
  }, [formatXAxis, labels.halfLife]);

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
              <h3 className="mb-3">Caffeine Levels Over Time</h3>
              <div style={{ width: '100%', height: 350 }}>
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
                      domain={[sixHoursBefore.getTime(), twelveHoursAhead.getTime()]}
                      tickCount={9}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis 
                      domain={[0, Math.ceil(maxLevel * 1.1 / 50) * 50]} 
                      padding={{ top: 15, bottom: 5 }}
                    />
                    <Tooltip content={(props) => CustomTooltip(props)} />
                    
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
                    
                    {/* Sleep time marker - with responsive label text and original positioning */}
                    <ReferenceLine 
                      x={sleepStart.getTime()} 
                      stroke="#6610f2" 
                      strokeDasharray="3 3" 
                      label={{
                        value: getSleepLabel(),
                        position: 'top',
                        fill: '#6610f2',
                        fontSize: 12,
                        offset: 15
                      }}
                    />
                    
                    {/* Current time marker - with responsive label text and original positioning */}
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
                      isAnimationActive={true}
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
                      isAnimationActive={true}
                      name="Projected Caffeine Level"
                      connectNulls={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2">
                <small className="text-muted">* Dotted green area shows projected caffeine decay {labels.halfLife}</small>
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