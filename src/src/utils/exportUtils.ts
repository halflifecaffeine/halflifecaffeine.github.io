import { CaffeineIntake, UserPreferences } from '../types';

/**
 * Export data as a JSON file
 * @param data The data to export
 * @param filename The filename to save as
 */
export const exportToJSON = (data: any, filename: string): void => {
  // Convert the data to a JSON string with pretty-printing (2 spaces)
  const json = JSON.stringify(data, null, 2);
  
  // Create a Blob with the JSON data
  const blob = new Blob([json], { type: 'application/json' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a download link and trigger it
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Convert an array of caffeine intakes to CSV format
 * @param intakes Array of caffeine intakes
 * @returns CSV formatted string
 */
const convertIntakesToCSV = (intakes: CaffeineIntake[]): string => {
  // Define CSV headers
  const headers = [
    'Date',
    'Time',
    'Brand',
    'Product',
    'Category',
    'Volume',
    'Unit',
    'Caffeine (mg)',
    'Notes'
  ];
  
  // Create rows from intake data
  const rows = intakes.map(intake => {
    const date = new Date(intake.datetime);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();
    
    return [
      dateStr,
      timeStr,
      intake.drink.brand,
      intake.drink.product,
      intake.drink.category,
      intake.volume.toString(),
      intake.unit,
      intake.mg.toString(),
      intake.notes || ''
    ];
  });
  
  // Combine headers and rows
  const csvContent = [
    headers,
    ...rows
  ]
    .map(row => 
      row
        .map(cell => 
          // Quote cells that contain commas or quotes
          cell.includes(',') || cell.includes('"') 
            ? `"${cell.replace(/"/g, '""')}"`
            : cell
        )
        .join(',')
    )
    .join('\n');
  
  return csvContent;
};

/**
 * Export caffeine intakes as a CSV file
 * @param intakes Array of caffeine intakes to export
 * @param filename The filename to save as
 */
export const exportToCSV = (intakes: CaffeineIntake[], filename: string): void => {
  // Sort intakes by date (newest first)
  const sortedIntakes = [...intakes].sort((a, b) => 
    new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  );
  
  // Convert to CSV
  const csv = convertIntakesToCSV(sortedIntakes);
  
  // Create a Blob with the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a download link and trigger it
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};