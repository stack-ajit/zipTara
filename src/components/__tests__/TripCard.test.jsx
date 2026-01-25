import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TripCard from '../TripCard';
import { BrowserRouter } from 'react-router-dom';
import * as useStore from '../../store/useStore';

// Mock the store hook
vi.mock('../../store/useStore', () => ({
    useTrips: vi.fn()
}));

describe('TripCard', () => {
    it('renders trip details correctly', () => {
        const trip = {
            id: '1',
            title: 'Test Trip',
            location: 'Paris',
            startDate: '2025-01-01',
            endDate: '2025-01-05',
            isPublic: true,
            cover: ''
        };

        useStore.useTrips.mockReturnValue({ deleteTrip: vi.fn() });

        render(
            <BrowserRouter>
                <TripCard trip={trip} />
            </BrowserRouter>
        );

        expect(screen.getByText('Test Trip')).toBeInTheDocument();
        expect(screen.getByText('Paris')).toBeInTheDocument();
        expect(screen.getByText('Public')).toBeInTheDocument();
    });
});
