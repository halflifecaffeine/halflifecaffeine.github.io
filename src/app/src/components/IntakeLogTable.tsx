import React from 'react';
import { Table, Button, ButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt, faCopy } from '@fortawesome/free-solid-svg-icons';
import { CaffeineIntake } from '../types';
import { formatVolume } from '../utils/conversions';

interface IntakeLogTableProps {
  intakes: CaffeineIntake[];
  onEditIntake: (intake: CaffeineIntake) => void;
  onDeleteIntake: (intake: CaffeineIntake) => void;
  onCloneIntake: (intake: CaffeineIntake) => void;
}

/**
 * Table component that displays a sortable list of caffeine intake records
 * with options to edit, clone, or delete each record.
 */
const IntakeLogTable: React.FC<IntakeLogTableProps> = ({ 
  intakes, 
  onEditIntake, 
  onDeleteIntake,
  onCloneIntake 
}) => {
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (intakes.length === 0) {
    return (
      <div className="text-center p-5 border rounded">
        <p className="text-muted mb-0">No caffeine intake recorded yet.</p>
      </div>
    );
  }

  // Sort intakes by date, most recent first
  const sortedIntakes = [...intakes].sort((a, b) => 
    new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  );

  return (
    <div className="table-responsive">
      <Table striped hover className="align-middle">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Drink</th>
            <th>Volume</th>
            <th>Caffeine (mg)</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedIntakes.map((intake) => (
            <tr key={intake.id}>
              <td>{formatDateTime(intake.datetime)}</td>
              <td>
                <div className="fw-medium">{intake.drink.manufacturer}</div>
                <div className="text-muted small">{intake.drink.product}</div>
              </td>
              <td>{formatVolume(intake.volume, intake.unit)}</td>
              <td>
                <strong>{intake.mg.toFixed(1)}</strong>
              </td>
              <td>
                <ButtonGroup size="sm" className="float-end">
                  <Button
                    variant="outline-secondary"
                    onClick={() => onCloneIntake(intake)}
                    title="Clone intake"
                    aria-label={`Clone intake at ${formatDateTime(intake.datetime)}`}
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => onEditIntake(intake)}
                    title="Edit intake"
                    aria-label={`Edit intake at ${formatDateTime(intake.datetime)}`}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => onDeleteIntake(intake)}
                    title="Delete intake"
                    aria-label={`Delete intake at ${formatDateTime(intake.datetime)}`}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default IntakeLogTable;
