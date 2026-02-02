import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label, Tooltip, Sector } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

interface CurrentCaffeineDonutProps {
  currentLevel: number;
  maxSafeLevel: number;
  sleepThreshold: number;
  halfLifeHours?: number;
}

interface CustomLabelProps {
  viewBox?: {
    cx: number;
    cy: number;
  };
  currentLevel: number;
}

// Custom label component for the center of the donut
const CustomLabel: React.FC<CustomLabelProps> = ({ viewBox, currentLevel }) => {
  if (!viewBox) return null;

  return (
    <g>
      <text
        x={viewBox.cx}
        y={viewBox.cy - 15}
        textAnchor="middle"
        dominantBaseline="central"
        className="donut-label-title"
        fontSize="16"
      >
        Current Level
      </text>
      <text
        x={viewBox.cx}
        y={viewBox.cy + 15}
        textAnchor="middle"
        dominantBaseline="central"
        className="donut-label-value"
        fontSize="22"
        fontWeight="bold"
      >
        ~{Math.round(currentLevel)} mg
      </text>
    </g>
  );
};

// Custom active shape for hover effect
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  const [theme] = useTheme();
  const isDarkMode = theme === 'dark';

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const tooltipClass = `custom-tooltip p-2 border rounded shadow${isDarkMode ? ' bg-dark text-light' : ' bg-light text-dark'}`;

    return (
      <div className={tooltipClass}>
        <p className="mb-1"><strong>{data.name}</strong></p>
        <p className="mb-0">Range: {data.range}</p>
        {data.description && (
          <p className={`mb-0 small ${isDarkMode ? 'text-light-emphasis' : 'text-muted'}`}>
            {data.description}
          </p>
        )}
      </div>
    );
  }

  return null;
};

const CurrentCaffeineDonut: React.FC<CurrentCaffeineDonutProps> = ({
  currentLevel,
  maxSafeLevel,
  sleepThreshold,
  halfLifeHours = 6
}) => {
  const [theme] = useTheme();
  const isDarkMode = theme === 'dark';

  // Define theme-aware colors
  const colors = {
    safe: '#28a745', // Green (consistent across themes)
    warning: '#ffc107', // Yellow (consistent across themes)
    danger: '#dc3545', // Red (consistent across themes)
    remaining: isDarkMode ? '#343a40' : '#f8f9fa' // Dark gray in dark mode, light gray in light mode
  };

  // Create data for the donut chart
  const createChartData = () => {
    const MAX_SCALE = 500; // Maximum value for the chart

    return [
      // Safe level segment (0 - sleepThreshold)
      {
        name: 'Safe Level',
        value: Math.min(sleepThreshold, currentLevel),
        range: `0 - ${sleepThreshold} mg`,
        fill: colors.safe,
        description: 'Unlikely to disrupt sleep'
      },
      // Sleep disruption level (sleepThreshold - maxSafeLevel)
      {
        name: 'May Disrupt Sleep',
        value: currentLevel > sleepThreshold
          ? Math.min(maxSafeLevel, currentLevel) - sleepThreshold
          : 0,
        range: `${sleepThreshold} - ${maxSafeLevel} mg`,
        fill: colors.warning,
        description: 'May affect sleep quality if consumed before bedtime'
      },
      // Excessive level (maxSafeLevel - currentLevel)
      {
        name: 'Excessive',
        value: currentLevel > maxSafeLevel
          ? currentLevel - maxSafeLevel
          : 0,
        range: `${maxSafeLevel}+ mg`,
        fill: colors.danger,
        description: 'Exceeds recommended daily intake'
      },
      // Remaining capacity (up to MAX_SCALE)
      {
        name: 'Remaining Capacity',
        value: Math.max(0, MAX_SCALE - currentLevel),
        range: '',
        fill: colors.remaining,
      }
    ];
  };

  const data = createChartData();

  // Calculate segments for the threshold markers
  const thresholdMarkers = [
    {
      name: 'Sleep Threshold Marker',
      value: sleepThreshold / 500 * 100,
      fill: colors.warning
    },
    {
      name: 'Max Safe Marker',
      value: maxSafeLevel / 500 * 100,
      fill: colors.danger
    }
  ];

  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const textClass = isDarkMode ? 'text-light-emphasis' : 'text-muted';

  return (
    <div className="current-caffeine-donut">
      <h3 className="mb-3">
        {<FontAwesomeIcon icon={faClock} className="me-2" />}
        Current <span className="d-inline d-lg-none">Caffeine</span> Level
      </h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            {/* Main donut chart */}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              dataKey="value"
              startAngle={180}
              endAngle={-180}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <Label
                content={<CustomLabel currentLevel={currentLevel} />}
                position="center"
              />
            </Pie>

            {/* Threshold marker lines */}
            <Pie
              data={thresholdMarkers}
              cx="50%"
              cy="50%"
              innerRadius={95}
              outerRadius={96}
              dataKey="value"
              startAngle={180}
              endAngle={-180}
            >
              {thresholdMarkers.map((entry, index) => (
                <Cell key={`marker-${index}`} fill={entry.fill} />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Left-justified legend */}
      <div className="mt-2 text-start">
        <div className="mb-1">
          <span className="badge bg-success me-1">■</span> Safe Level (0-{sleepThreshold}mg)
        </div>
        <div className="mb-1">
          <span className="badge bg-warning me-1">■</span> May Disrupt Sleep ({sleepThreshold}-{maxSafeLevel}mg)
        </div>
        <div className="mb-1">
          <span className="badge bg-danger me-1">■</span> Excessive ({maxSafeLevel}mg+)
        </div>
        <div className={`mt-2 small ${textClass}`}>
          Using {halfLifeHours}-hour caffeine half-life
        </div>
      </div>
    </div>
  );
};

export default CurrentCaffeineDonut;