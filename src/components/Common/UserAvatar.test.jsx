import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import UserAvatar from './UserAvatar';

describe('UserAvatar', () => {
  it('renders the profile image when one is available', () => {
    render(<UserAvatar user={{ full_name: 'Ana Ruiz', profile_image: 'https://example.com/ana.jpg' }} />);

    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/ana.jpg');
  });

  it('shows the user initial when the profile image fails to load', () => {
    render(<UserAvatar user={{ full_name: 'Ana Ruiz', profile_image: 'https://example.com/ana.jpg' }} />);
    fireEvent.error(screen.getByRole('img'));

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows the user initial when no profile image is available', () => {
    render(<UserAvatar user={{ full_name: 'Ana Ruiz' }} />);

    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
