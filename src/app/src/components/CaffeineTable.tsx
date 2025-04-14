import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { TimeSeriesData } from '../engine/caffeineCalculator';

interface CaffeineTableProps {
  data: TimeSeriesData[];
  maxSafeLevel: number;
  sleepThreshold: number;
}

const CaffeineTable: React.FC<CaffeineTableProps> = ({ 
  data, 
  maxSafeLevel,
  sleepThreshold 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4 bg-light rounded">
        <p>No caffeine data available to display.</p>
      </div>
    );
  }

  // Determine increment to show reasonable number of rows (not all 24 hours)
  const getHourlyData = () => {
    const result: TimeSeriesData[] = [];
    const hourMap = new Map<number, TimeSeriesData>();
    
    // Group by hour and take the latest data point for each hour
    data.forEach(point => {
      const hour = point.time.getHours();
      hourMap.set(hour, point);
    });
    
    // Sort hours and create the result array
    const sortedHours = Array.from(hourMap.keys()).sort((a, b) => a - b);
    sortedHours.forEach(hour => {
      result.push(hourMap.get(hour)!);
    });
    
    return result;
  };

  const hourlyData = getHourlyData();

  return (
    <div className="caffeine-table mt-4">
      <h3 className="mb-3">Hourly Caffeine Levels</h3>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Time</th>
              <th>Caffeine Level (mg)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {hourlyData.map((point, index) => (
              <tr key={index}>
                <td>
                  {point.time.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </td>
                <td>{Math.round(point.level * 100) / 100} mg</td>
                <td>
                  {point.level > maxSafeLevel ? (
                    <Badge bg="danger">Above Safe Level</Badge>
                  ) : point.level > sleepThreshold ? (
                    <Badge bg="warning" text="dark">May Disrupt Sleep</Badge>
                  ) : point.level > 0 ? (
                    <Badge bg="success">Normal Range</Badge>
                  ) : (
                    <Badge bg="secondary">None</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      <div className="mt-3">
        <small className="text-muted">
          This table shows the projected caffeine level at different hours based on your 
          current and past intake. The caffeine calculator uses a standard 6-hour half-life
          for metabolism.
        </small>
      </div>
    </div>
  );
};

export default CaffeineTable;