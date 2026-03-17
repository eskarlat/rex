import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable } from './DataTable';

describe('DataTable', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ];

  const data = [
    { name: 'Alice', status: 'active' },
    { name: 'Bob', status: 'inactive' },
  ];

  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('inactive')).toBeInTheDocument();
  });

  it('handles missing values gracefully', () => {
    const sparseData = [{ name: 'Charlie' }];
    render(<DataTable columns={columns} data={sparseData} />);
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DataTable columns={columns} data={data} className="custom-table" />
    );
    const table = container.querySelector('table');
    expect(table).toHaveClass('custom-table');
  });
});
