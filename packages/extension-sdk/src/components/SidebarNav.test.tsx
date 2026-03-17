import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SidebarNav } from './SidebarNav';

describe('SidebarNav', () => {
  const items = [
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'Settings', href: '/settings' },
    { label: 'Extensions', href: '/extensions' },
  ];

  it('renders all navigation items', () => {
    render(<SidebarNav items={items} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Extensions')).toBeInTheDocument();
  });

  it('renders items as links with correct hrefs', () => {
    render(<SidebarNav items={items} />);
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    const settingsLink = screen.getByText('Settings').closest('a');
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('applies active styling to active items', () => {
    render(<SidebarNav items={items} />);
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-accent');
  });

  it('applies inactive styling to non-active items', () => {
    render(<SidebarNav items={items} />);
    const settingsLink = screen.getByText('Settings').closest('a');
    expect(settingsLink).toHaveClass('text-muted-foreground');
  });

  it('renders a nav element', () => {
    render(<SidebarNav items={items} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SidebarNav items={items} className="custom-nav" />);
    expect(screen.getByRole('navigation')).toHaveClass('custom-nav');
  });
});
